import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        );
      }
    }

    return pages;
  };

  const pages = getPages();

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between border-t border-border/40 px-4 py-3 sm:px-6 ${className}`}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/40 disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/40 disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium font-sans text-muted-foreground">
            Showing Page{' '}
            <span className="font-semibold text-foreground">{currentPage}</span>{' '}
            of{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        </div>

        <div>
          <span className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-1">
            {/* Prev button */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-secondary/60 disabled:opacity-50 disabled:pointer-events-none focus:z-20 focus:outline-none"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Pages list */}
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={idx}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium font-sans text-muted-foreground/60 select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isCurrent = pageNum === currentPage;

              return (
                <button
                  key={idx}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold font-sans focus:outline-none focus:z-20
                    ${isCurrent ? 'bg-primary text-white border border-primary' : 'border border-border bg-card text-foreground hover:bg-secondary/40'}
                  `}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next button */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-secondary/60 disabled:opacity-50 disabled:pointer-events-none focus:z-20 focus:outline-none"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;
