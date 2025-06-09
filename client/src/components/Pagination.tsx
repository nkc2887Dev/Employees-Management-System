import React from 'react';
import { PreviousIcon, NextIcon } from '../icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  hasItems: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onLimitChange,
  hasItems,
}) => {
  return (
    <div className="mt-4 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
          <select
            value={pageSize}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="mt-1 block w-20 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || !hasItems}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === 1 || !hasItems
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <PreviousIcon />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                disabled={!hasItems}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === i + 1
                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                } ${!hasItems ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || !hasItems}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === totalPages || !hasItems
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <NextIcon />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
