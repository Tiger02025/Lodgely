import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  FlagIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Properties', href: '/properties', icon: BuildingStorefrontIcon },
  { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: FlagIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
];

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-primary-50">
      <nav className="flex flex-col w-64 bg-white shadow-sm">
        <div className="p-4 border-b border-primary-100">
          <img src="/logo.png" alt="Lodgely" className="h-9 w-auto" />
          <span className="block mt-1 text-xs font-medium text-primary-500">Admin</span>
        </div>
        <div className="flex-1 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-primary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700 border-r-3 border-primary-600' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <span className="ml-2 text-sm text-primary-700">{user?.email || 'admin@lodgely.com'}</span>
          </div>
          <button
            onClick={logout}
            className="w-full btn-outline text-sm"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
