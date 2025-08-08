import React from 'react';
import { Customer } from '../../services/api';
import CustomerCard from './CustomerCard';
import { getUIText } from '../../utils/hebrewUtils';

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
  scoreFilter: string;
  sortBy: string;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  searchTerm,
  scoreFilter,
  sortBy,
}) => {
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    return matchesSearch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (sortedCustomers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 hebrew-content">{getUIText('no_customers')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedCustomers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
};

export default CustomerList; 