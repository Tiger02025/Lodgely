import { useQuery } from 'react-query';
import api from '../lib/api';
import { BookingStatus } from '../types';

interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalPrice: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    images: { url: string; isPrimary: boolean }[];
  };
  createdAt: string;
}

interface PaginatedResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

const statusLabels = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.APPROVED]: 'Approved',
  [BookingStatus.REJECTED]: 'Rejected',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.COMPLETED]: 'Completed',
};

const statusColors = {
  [BookingStatus.PENDING]: 'badge-pending',
  [BookingStatus.APPROVED]: 'badge-available',
  [BookingStatus.REJECTED]: 'badge-unavailable',
  [BookingStatus.CANCELLED]: 'badge-unavailable',
  [BookingStatus.COMPLETED]: 'badge-available',
};

export default function Bookings() {
  const { data, isLoading } = useQuery(['bookings'], () =>
    api.get('/admin/bookings').then((res) => res.data.data as PaginatedResponse),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Bookings</h2>
        <p className="text-sm text-primary-700 mt-1">Manage booking requests</p>
      </div>

      {isLoading ? (
        <p className="text-center py-10">Loading bookings...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-center py-10 text-primary-500">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden">
            <thead className="bg-primary-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {data?.data.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {booking.property.images.length > 0 && booking.property.images[0] ? (
                        <img
                          src={booking.property.images[0].url}
                          alt={booking.property.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-primary-200 rounded-lg flex items-center justify-center">
                          <span className="text-primary-500 text-xs">No img</span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium text-primary-900">{booking.property.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary-900">
                      {booking.user.firstName} {booking.user.lastName}
                    </p>
                    <p className="text-sm text-primary-500">{booking.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-500">
                    {new Date(booking.checkInDate).toLocaleDateString()} -{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium">${booking.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
