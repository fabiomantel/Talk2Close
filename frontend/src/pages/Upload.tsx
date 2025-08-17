import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import FileUpload from '../components/upload/FileUpload';
import CustomerForm from '../components/upload/CustomerForm';
import UploadProgress from '../components/upload/UploadProgress';
import { useErrorDialog, handleApiError } from '../hooks/useErrorDialog';
import ErrorDialog from '../components/common/ErrorDialog';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { getUIText } from '../utils/hebrewUtils';

const Upload: React.FC = () => {
  console.log('📤 Upload Component: Initializing file upload interface');
  
  const [file, setFile] = useState<File | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { error: dialogError, isOpen, showError, hideError } = useErrorDialog();

  console.log('📁 Upload State:', { file: file?.name, customerData, uploading });

  const uploadMutation = useMutation({
    mutationFn: apiService.uploadFile,
    onSuccess: (data) => {
      console.log('✅ Upload Mutation Success:', data);
      
      // Show success message with analysis status
      if (data.data.analysisStatus === 'completed') {
        alert(`✅ Upload and analysis completed successfully!\n\nCustomer: ${data.data.customer.name}\nOverall Score: ${data.data.scoring?.scores.overall}/100\n\nYou can view the detailed analysis in the Analysis section.`);
      } else if (data.data.analysisStatus === 'failed') {
        alert(`⚠️ File uploaded successfully, but analysis failed.\n\nError: ${data.data.analysisError}\n\nYou can retry the analysis later.`);
      } else {
        alert('✅ File uploaded successfully!');
      }
      
      try {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['analyses'] });
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      } catch (error) {
        console.warn('⚠️ Query invalidation failed:', error);
      }
      setFile(null);
      setCustomerData({ name: '', phone: '', email: '' });
      setUploading(false);
    },
    onError: (error) => {
      console.error('❌ Upload Mutation Error:', error);
      handleApiError(error, showError);
      setUploading(false);
    },
    onMutate: () => {
      console.log('🔄 Upload Mutation Started');
      setUploading(true);
    },
  });

  const handleUpload = async () => {
    console.log('🚀 Upload Handler: Starting file upload process');
    console.log('📋 Upload Validation:', { file: file?.name, customerName: customerData.name, customerPhone: customerData.phone });
    
    if (!file || !customerData.name || !customerData.phone) {
      console.warn('⚠️ Upload Validation Failed: Missing required fields');
      showError('Please select a file and fill in customer details');
      return;
    }

    console.log('✅ Upload Validation Passed: Proceeding with upload');
    
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('customerName', customerData.name);
    formData.append('customerPhone', customerData.phone);
    if (customerData.email) {
      formData.append('customerEmail', customerData.email);
    }

    console.log('📦 FormData Prepared:', Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`));

    console.log('🔄 Upload Mutation: Calling API');
    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto rtl-layout">
      <div className="text-center mb-8">
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-2 text-3xl font-bold text-gray-900 hebrew-content">{getUIText('upload_sales_call')}</h1>
        <p className="mt-2 text-sm text-gray-600 hebrew-content">
          העלה הקלטת שיחת מכירה בעברית לניתוח וציון
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6 rtl-card">
        <FileUpload onFileSelect={setFile} selectedFile={file} />
        <CustomerForm data={customerData} onChange={setCustomerData} />
        
        {uploading && <UploadProgress />}
        
        <div className="flex justify-end rtl-justify-start">
          <button
            onClick={handleUpload}
            disabled={!file || !customerData.name || !customerData.phone || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rtl-button"
          >
            {uploading ? 'מעלה ומנתח...' : 'העלאה וניתוח'}
          </button>
        </div>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isOpen}
        onClose={hideError}
        error={dialogError}
        title={getUIText('upload_error')}
      />
    </div>
  );
};

export default Upload; 