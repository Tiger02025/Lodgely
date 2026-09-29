from fastapi import Body, FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Lodgely AI Matching Service", version="1.0.0")


class Candidate(BaseModel):
    id: str
    first_name: str = ""
    last_name: str = ""
    university: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class MatchRequest(BaseModel):
    user_id: str
    user_profile: Candidate
    candidates: List[Candidate] = Field(default_factory=list)


class MatchResult(BaseModel):
    match_id: str
    user_b_id: str
    score: float
    reasons: List[str]


class MatchResponse(BaseModel):
    user_id: str
    matches: List[MatchResult]


def preprocess_text(text: str) -> str:
    """Clean and normalize text for TF-IDF."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\W", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_features(profile: Candidate) -> str:
    """Combine all profile fields into a single text for matching."""
    parts = []
    if profile.first_name:
        parts.append(profile.first_name)
    if profile.last_name:
        parts.append(profile.last_name)
    if profile.university:
        parts.append(profile.university)
    if profile.bio:
        parts.append(profile.bio)
    if profile.preferences:
        for key, value in profile.preferences.items():
            parts.append(f"{key} {value}")
    return " ".join(parts)


def compute_similarity(texts: List[str]) -> np.ndarray:
    """Compute cosine similarity matrix for a list of texts."""
    if len(texts) <= 1:
        return np.array([[1.0]])

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=1000,
        min_df=1,
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        similarity_matrix = cosine_similarity(tfidf_matrix)
        return similarity_matrix
    except Exception as e:
        logger.warning(f"TF-IDF failed: {e}. Using fallback similarity.")
        similarity_matrix = np.eye(len(texts))
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                sim = 0.5
                similarity_matrix[i][j] = sim
                similarity_matrix[j][i] = sim
        return similarity_matrix


def generate_reasons(
    user: Candidate, candidate: Candidate, score: float, user_features: List[str]
) -> List[str]:
    """Generate human-readable reasons for why two users match."""
    reasons = []

    if user.university and candidate.university:
        if user.university.lower() == candidate.university.lower():
            reasons.append("You attend the same university")

    if user.bio and candidate.bio:
        user_bio_words = set(preprocess_text(user.bio).split())
        cand_bio_words = set(preprocess_text(candidate.bio).split())
        common_words = user_bio_words & cand_bio_words
        if len(common_words) > 2:
            reasons.append(f"Shared interests: {', '.join(list(common_words)[:5])}")
        elif len(common_words) > 0:
            reasons.append("Similar interests detected in profiles")

    if user.preferences and candidate.preferences:
        common_keys = set(user.preferences.keys()) & set(candidate.preferences.keys())
        for key in common_keys:
            if str(user.preferences[key]) == str(candidate.preferences[key]):
                reasons.append(f"Align on {key}")

    if not reasons and score > 0.5:
        reasons.append("Good overall compatibility based on profile data")

    if not reasons:
        reasons.append("Basic profile match")

    return reasons[:5]


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-matching"}


@app.post("/match", response_model=MatchResponse)
async def match_roommates(request: MatchRequest):
    """Find compatible roommate matches for a given user."""
    if not request.candidates:
        return MatchResponse(user_id=request.user_id, matches=[])

    user_features_text = extract_features(request.user_profile)
    texts = [user_features_text] + [extract_features(c) for c in request.candidates]

    similarity_matrix = compute_similarity(texts)
    user_similarities = similarity_matrix[0][1:]

    max_matches = min(5, len(request.candidates))
    top_indices = np.argsort(user_similarities)[::-1][:max_matches]

    matches = []

    for idx in top_indices:
        score = float(user_similarities[idx])
        if score < 0.1:
            continue
        candidate = request.candidates[idx]
        reasons = generate_reasons(request.user_profile, candidate, score, [])
        matches.append(
            MatchResult(
                match_id=f"match_{request.user_id}_{candidate.id}",
                user_b_id=candidate.id,
                score=round(score, 4),
                reasons=reasons,
            )
        )

    return MatchResponse(user_id=request.user_id, matches=matches)


@app.post("/similarity")
async def get_similarity_scores(texts: List[str]):
    """Get pairwise similarity scores for a set of texts."""
    if len(texts) < 2:
        raise HTTPException(status_code=400, detail="At least 2 texts required")

    similarity = compute_similarity(texts)
    return {
        "similarity_matrix": similarity.tolist(),
        "pairwise_scores": [
            {"i": i, "j": j, "score": round(float(similarity[i][j]), 4)}
            for i in range(len(texts))
            for j in range(i + 1, len(texts))
        ],
    }


@app.post("/preferences")
async def extract_preferences(bio: str = Body(...)):
    """Extract key preferences from a user bio."""
    processed = preprocess_text(bio)
    words = processed.split()
    key_phrases = []

    for i in range(len(words) - 1):
        phrase = f"{words[i]} {words[i + 1]}"
        key_phrases.append(phrase)

    return {
        "clean_text": processed,
        "word_count": len(words),
        "key_phrases": key_phrases[:10],
    }
