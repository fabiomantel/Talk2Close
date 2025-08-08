import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

interface CustomerData {
  name: string;
  phone: string;
  email: string;
}

interface CustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof CustomerData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 rtl-form">
      <h3 className="text-lg font-medium text-gray-900 hebrew-content">{getUIText('customer_information')}</h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 hebrew-content">
          {getUIText('name')} *
        </label>
        <input
          type="text"
          id="name"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm rtl-input"
          placeholder="הכנס שם לקוח"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 hebrew-content">
          {getUIText('phone')} *
        </label>
        <input
          type="tel"
          id="phone"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm rtl-input"
          placeholder="הכנס מספר טלפון"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 hebrew-content">
          {getUIText('email')} (אופציונלי)
        </label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm rtl-input"
          placeholder="הכנס כתובת אימייל"
        />
      </div>
    </div>
  );
};

export default CustomerForm; 