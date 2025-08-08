import React from 'react';
import { Customer } from '../../services/api';
import { formatHebrewDate, getUIText } from '../../utils/hebrewUtils';

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {customer.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 hebrew-content">{customer.name}</h3>
          <p className="text-sm text-gray-500 hebrew-content">{customer.phone}</p>
        </div>
      </div>

      {customer.email && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 hebrew-content">{customer.email}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 hebrew-content">
          {getUIText('created_at')}: {formatHebrewDate(customer.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default CustomerCard; 