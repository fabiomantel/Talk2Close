import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  UsersIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  BugAntIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ScaleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';
import { config } from '../../config/environment';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavigationItem[];
}

const Sidebar: React.FC = () => {
  const isDebugEnabled = config.DEBUG_MODE;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([getUIText('settings_nav')]));

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const navigation: NavigationItem[] = [
    { name: getUIText('dashboard_nav'), href: '/', icon: HomeIcon },
    { name: getUIText('upload_nav'), href: '/upload', icon: CloudArrowUpIcon },
    { name: getUIText('customers_nav'), href: '/customers', icon: UsersIcon },
    { name: getUIText('analysis_nav'), href: '/analysis', icon: ChartBarIcon },
    { 
      name: getUIText('settings_nav'), 
      icon: Cog6ToothIcon,
      children: [
        { name: getUIText('scoring_settings'), href: '/configuration', icon: ScaleIcon },
        { name: getUIText('batch_settings'), href: '/batch-processing', icon: CpuChipIcon },
      ]
    },
    // Only show debug navigation if debug mode is enabled
    ...(isDebugEnabled ? [{ name: 'Debug', href: '/debug', icon: BugAntIcon }] : []),
  ];

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const paddingLeft = level === 0 ? 'px-2' : 'px-6';

    return (
      <div key={item.name}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`group flex items-center w-full ${paddingLeft} py-2 text-sm font-medium rounded-md transition-colors rtl-nav-item hebrew-content text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
          >
            <item.icon
              className="ml-3 h-5 w-5"
              aria-hidden="true"
            />
            <span className="flex-1 hebrew-content">{item.name}</span>
            {isExpanded ? (
              <ChevronDownIcon className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRightIcon className="mr-2 h-4 w-4" />
            )}
          </button>
        ) : (
          <NavLink
            to={item.href!}
            className={({ isActive }) =>
              `group flex items-center ${paddingLeft} py-2 text-sm font-medium rounded-md transition-colors rtl-nav-item hebrew-content ${level > 0 ? 'nested-item' : ''} ${
                isActive
                  ? 'bg-blue-50 text-blue-700 rtl-border-l border-blue-700 active'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className="ml-3 h-5 w-5"
              aria-hidden="true"
            />
            <span className="hebrew-content">{item.name}</span>
          </NavLink>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white shadow-sm rtl-sidebar">
      <nav className="mt-8 rtl-navigation">
        <div className="px-4 space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 