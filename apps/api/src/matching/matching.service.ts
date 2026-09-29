import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { Role, MatchStatus } from '../common/enums';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface MatchSuggestion {
  // Shape returned by the AI service's /match endpoint.
  match_id: string;
  user_b_id: string;
  score: number;
  reasons?: string[];
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async requestMatch(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const otherStudents = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        id: { not: userId },
        isVerified: true,
      },
      take: 50,
    });

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(`${aiServiceUrl}/match`, {
          user_id: userId,
          user_profile: {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            university: user.university,
            bio: user.bio,
          },
          candidates: otherStudents.map((s) => ({
            id: s.id,
            first_name: s.firstName,
            last_name: s.lastName,
            university: s.university,
            bio: s.bio,
          })),
        }),
      );

      const matches: MatchSuggestion[] = response.data.matches ?? [];

      // Persist the suggestions so GET /matching has something to return.
      // The unique index is on (userAId, userBId), so normalise the ordering to
      // keep a re-run of the request from creating duplicate rows.
      await Promise.all(
        matches.map((m) => {
          const [userAId, userBId] = [userId, m.user_b_id].sort();
          return this.prisma.match.upsert({
            where: { userAId_userBId: { userAId, userBId } },
            create: {
              userAId,
              userBId,
              score: m.score,
              reasons: JSON.stringify(m.reasons ?? []),
              status: MatchStatus.PENDING,
            },
            update: {
              score: m.score,
              reasons: JSON.stringify(m.reasons ?? []),
            },
          });
        }),
      );

      return matches;
    } catch (error) {
      this.logger.error(`AI service error: ${(error as Error).message}`);
      throw new ServiceUnavailableException('AI matching service unavailable');
    }
  }

  async saveMatch(userAId: string, userBId: string, score: number, reasons: string[]) {
    const [a, b] = [userAId, userBId].sort();
    return this.prisma.match.upsert({
      where: { userAId_userBId: { userAId: a, userBId: b } },
      create: {
        userAId: a,
        userBId: b,
        score,
        reasons: JSON.stringify(reasons),
        status: MatchStatus.PENDING,
      },
      update: { score, reasons: JSON.stringify(reasons) },
    });
  }

  async getMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        userA: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            university: true,
            profileImage: true,
          },
        },
        userB: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            university: true,
            profileImage: true,
          },
        },
      },
    });

    // reasons is stored as a JSON string but every client expects an array.
    return matches.map((match) => {
      let reasons: string[] = [];
      try {
        const parsed = JSON.parse(match.reasons);
        if (Array.isArray(parsed)) {
          reasons = parsed;
        }
      } catch {
        reasons = [];
      }
      return { ...match, reasons };
    });
  }

  async respondToMatch(matchId: string, userId: string, accept: boolean) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new Error('You are not part of this match');
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: accept ? MatchStatus.ACCEPTED : MatchStatus.REJECTED,
      },
    });
  }
}
