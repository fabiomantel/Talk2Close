import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import CustomerList from '../components/customers/CustomerList';
import CustomerFilters from '../components/customers/CustomerFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overallScore');

  const {
    data: customersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: apiService.getCustomers,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load customers" />;
  }

  const customers = customersData?.data.customers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <div className="text-sm text-gray-500">
          {customers.length} customers total
        </div>
      </div>

      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        scoreFilter={scoreFilter}
        onScoreFilterChange={setScoreFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <CustomerList
        customers={customers}
        searchTerm={searchTerm}
        scoreFilter={scoreFilter}
        sortBy={sortBy}
      />
    </div>
  );
};

export default Customers; 