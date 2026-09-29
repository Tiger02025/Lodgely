import { useQuery } from 'react-query';
import api from '../lib/api';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  FlagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalReports: number;
  pendingVerifications: number;
  bookingsByStatus: Record<string, number>;
  propertiesByType: Record<string, number>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery(['stats'], () =>
    api.get('/admin/stats').then((res) => res.data.data as Stats),
  );

  const statCards = [
    {
      name: 'Total Users',
      value: data?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-primary-100 text-primary-700',
    },
    {
      name: 'Properties',
      value: data?.totalProperties || 0,
      icon: BuildingStorefrontIcon,
      color: 'bg-secondary-100 text-secondary-800',
    },
    {
      name: 'Bookings',
      value: data?.totalBookings || 0,
      icon: CalendarIcon,
      color: 'bg-accent-100 text-accent-800',
    },
    {
      name: 'Reports',
      value: data?.totalReports || 0,
      icon: FlagIcon,
      color: 'bg-red-100 text-red-700',
    },
    {
      name: 'Pending Verifications',
      value: data?.pendingVerifications || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-primary-600 text-white',
    },
  ];

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Dashboard</h2>
        <p className="text-sm text-primary-700 mt-1">Overview of your platform performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-primary-700">{card.name}</p>
                <p className="text-2xl font-bold text-primary-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {data?.bookingsByStatus &&
              Object.entries(data.bookingsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-primary-700 capitalize">{status.toLowerCase()}</span>
                  <span className="font-medium text-primary-900">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Properties by Type</h3>
          <div className="space-y-3">
            {data?.propertiesByType &&
              Object.entries(data.propertiesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-primary-700 capitalize">{type.toLowerCase()}</span>
                  <span className="font-medium text-primary-900">{count as number}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
