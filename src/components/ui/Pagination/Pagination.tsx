// src/components/ui/Pagination/Pagination.tsx
import {
    ChevronLeftIcon,
    ChevronRightIcon,
  } from '@heroicons/react/20/solid';
  
  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
  }
  
  export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
  }: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
    return (
      <nav
        className={`flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 ${className}`}
      >
        <div className="flex w-0 flex-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
            Previous
          </button>
        </div>
        <div className="hidden md:flex">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium
                ${
                  page === currentPage
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>
        <div className="flex w-0 flex-1 justify-end">
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
    );
  }