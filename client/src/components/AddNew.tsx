import React from 'react';
import { AddIcon } from '../icons';
import { Link } from 'react-router-dom';

interface ErrorHandlingProps {
  title: string;
  route: string;
}

const AddNew: React.FC<ErrorHandlingProps> = ({ route, title }) => {
  return (
    <Link
      to={route}
      className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-white hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <AddIcon className="-ml-1 mr-2 h-5 w-5" />
      Add {title}
    </Link>
  );
};

export default AddNew;
