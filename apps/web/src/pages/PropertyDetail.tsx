import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../lib/api';
import { PropertyStatus, PropertyType } from '../types';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  deposit: number;
  monthlyRent: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  amenities: string[];
  status: PropertyStatus;
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
  };
  images: { id: string; url: string; publicId?: string; altText?: string; isPrimary: boolean }[];
  reviews: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(['property', id], () =>
    api.get(`/properties/${id}`).then((res) => res.data.data.property as Property),
  );

  const avgRating = data?.reviews.length
    ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
    : 0;

  if (isLoading) {
    return <div className="text-center py-10">Loading property...</div>;
  }

  if (!data) {
    return <div className="text-center py-10 text-primary-500">Property not found</div>;
  }

  const primaryImage = data.images.find((img) => img.isPrimary) || data.images[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-primary-700 hover:text-primary-900"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || data.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-primary-200 rounded-lg flex items-center justify-center">
              <span className="text-primary-500">No image available</span>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {data.images.slice(0, 4).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.altText || ''}
                className="w-full h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-primary-900">{data.title}</h1>
            <span className="badge badge-available">{data.status}</span>
          </div>

          <p className="text-3xl font-bold text-primary-700">${data.monthlyRent}/mo</p>

          <div className="grid grid-cols-2 gap-4">
            <div><strong>{data.bedrooms}</strong> Bedrooms</div>
            <div><strong>{data.bathrooms}</strong> Bathrooms</div>
            <div><strong>{data.maxOccupancy}</strong> Max Occupancy</div>
            <div><strong>${data.deposit}</strong> Deposit</div>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-2">Address</h3>
            <p className="text-primary-700">{data.address}</p>
            <p className="text-primary-700">{data.city}, {data.state} {data.zipCode}</p>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {data.amenities.map((amenity, i) => (
                <span key={i} className="text-sm text-primary-700 bg-primary-50 px-2 py-1 rounded">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary-900 mb-4">Description</h2>
        <p className="text-primary-700 whitespace-pre-wrap">{data.description}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary-900 mb-4">
          Reviews ({data.reviews.length})
        </h2>
        {avgRating > 0 && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary-700">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-primary-500 ml-2">average rating</span>
          </div>
        )}
        {data.reviews.length === 0 ? (
          <p className="text-primary-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {data.reviews.map((review) => (
              <div key={review.id} className="border border-primary-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? 'text-accent-500' : 'text-primary-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-primary-700">{review.comment}</p>
                <p className="text-sm text-primary-500 mt-2">
                  By {review.user.firstName} {review.user.lastName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary-900 mb-4">Landlord</h2>
        <div className="flex items-center">
          {data.landlord.profileImage ? (
            <img src={data.landlord.profileImage} alt="Landlord" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="font-medium text-primary-700">
                {data.landlord.firstName[0]}
                {data.landlord.lastName[0]}
              </span>
            </div>
          )}
          <div className="ml-4">
            <p className="font-semibold text-primary-900">
              {data.landlord.firstName} {data.landlord.lastName}
            </p>
            <p className="text-sm text-primary-500">{data.landlord.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
