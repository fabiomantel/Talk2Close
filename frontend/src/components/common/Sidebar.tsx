import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  UsersIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: getUIText('dashboard_nav'), href: '/', icon: HomeIcon },
    { name: getUIText('upload_nav'), href: '/upload', icon: CloudArrowUpIcon },
    { name: getUIText('customers_nav'), href: '/customers', icon: UsersIcon },
    { name: getUIText('analysis_nav'), href: '/analysis', icon: ChartBarIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-sm rtl-sidebar">
      <nav className="mt-8">
        <div className="px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors rtl-nav-item ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 rtl-border-l border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="rtl-icon-right h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 