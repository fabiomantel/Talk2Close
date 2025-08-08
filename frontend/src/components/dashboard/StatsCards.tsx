import React from 'react';
import { DashboardStats } from '../../services/api';
import { 
  UsersIcon, 
  PhoneIcon, 
  ChartBarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { getScoreColor, getUIText } from '../../utils/hebrewUtils';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      name: getUIText('total_customers'),
      value: stats.overview.totalCustomers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'סה"כ שיחות',
      value: stats.overview.totalSalesCalls,
      icon: PhoneIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'שיחות מדורגות',
      value: stats.overview.totalScored,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase',
    },
    {
      name: getUIText('average_score'),
      value: Math.round(stats.scores.avgOverall),
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'increase',
      isScore: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white overflow-hidden shadow rounded-lg rtl-card"
        >
          <div className="p-5">
            <div className="flex items-center rtl-flex-row-reverse">
              <div className="flex-shrink-0">
                <card.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="rtl-ml-auto w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate hebrew-content">
                    {card.name}
                  </dt>
                  <dd className="flex items-baseline rtl-flex-row-reverse">
                    <div className={`text-2xl font-semibold ${
                      card.isScore ? getScoreColor(card.value) : 'text-gray-900'
                    }`}>
                      {card.value}
                      {card.isScore && <span className="text-sm">/100</span>}
                    </div>
                    <div className="rtl-mr-auto flex items-baseline text-sm font-semibold text-green-600">
                      {card.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards; 