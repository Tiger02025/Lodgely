import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import { PropertyStatus, PropertyType } from '../types';
import { CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  price: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  images: { url: string; isPrimary: boolean }[];
  createdAt: string;
}

interface PaginatedResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

export default function Properties() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery(['properties'], () =>
    api.get('/admin/properties').then((res) => res.data.data as PaginatedResponse),
  );

  const verifyMutation = useMutation(
    ({ id, verified }: { id: string; verified: boolean }) =>
      api.post(`/properties/${id}/verify`, { verified }).then((res) => res.data),
    {
      onSuccess: () => queryClient.invalidateQueries('properties'),
    },
  );

  const filteredProperties = data?.data.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.landlord.lastName.toLowerCase().includes(search.toLowerCase()),
  ) || [];

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return <span className="badge badge-available">Available</span>;
      case PropertyStatus.UNAVAILABLE:
        return <span className="badge badge-unavailable">Unavailable</span>;
      case PropertyStatus.PENDING_VERIFICATION:
        return <span className="badge badge-pending">Pending Verification</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Properties</h2>
        <p className="text-sm text-primary-700 mt-1">Manage property listings</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-primary-500 absolute left-3 top-2.5" />
      </div>

      {isLoading ? (
        <p className="text-center py-10">Loading properties...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="card">
              {property.images.length > 0 && property.images[0] ? (
                <img
                  src={property.images[0].url}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-primary-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-primary-500">No image</span>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">{property.title}</h3>
                  <p className="text-sm text-primary-700 mt-1">
                    {property.city}, {property.state}
                  </p>
                  <p className="text-lg font-semibold text-primary-700 mt-2">${property.price}/mo</p>
                  <p className="text-sm text-primary-500 mt-1">
                    {property.bedrooms} bed • {property.bathrooms} bath • {property.propertyType}
                  </p>
                </div>
                {getStatusBadge(property.status)}
              </div>

              {property.status === PropertyStatus.PENDING_VERIFICATION && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => verifyMutation.mutate({ id: property.id, verified: true })}
                    className="flex-1 btn-success text-sm"
                  >
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => verifyMutation.mutate({ id: property.id, verified: false })}
                    className="flex-1 btn-outline text-sm"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
