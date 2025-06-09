import React from 'react';
import PageContainer from './PageContainer';
import { ErrorIcon } from '../icons';

interface ErrorHandlingProps {
  title: string;
}

const ErrorHandling: React.FC<ErrorHandlingProps> = ({ title }) => {
  return (
    <PageContainer>
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <ErrorIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Error Loading {title}</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    </PageContainer>
  );
};

export default ErrorHandling;
