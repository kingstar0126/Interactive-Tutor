import React, { useMemo } from "react";

const Pagination = ({ page, onPageChange, count }) => {
  const pages = useMemo(() => {
    if (count <= 10) {
      return Array.from({ length: count }, (_, i) => i + 1);
    }

    if (page < 5) {
      return [1, 2, 3, 4, 5, 0, count - 1];
    }

    if (page > count - 5) {
      return [1, 0, count - 5, count - 4, count - 3, count - 2, count - 1];
    }

    return [1, 0, page - 1, page, page + 1, 0, count - 1];
  }, [page, count]);

  return (
    <nav aria-label="Page navigation example">
      <ul className="inline-flex -space-x-px text-sm">
        <li
          onClick={() => {
            if (page > 0) {
              onPageChange(page - 1);
            }
          }}
        >
          <div className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            {"<"}
          </div>
        </li>
        {pages.map((item, index) => (
          <li key={index}>
            {item !== 0 ? (
              <div
                onClick={() => onPageChange(item)}
                className={`flex h-8 items-center justify-center border border-gray-300 px-3 dark:border-gray-700 ${
                  page === item
                    ? "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-700 dark:text-white"
                    : "bg-white  leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                {item}
              </div>
            ) : (
              <div className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                ...
              </div>
            )}
          </li>
        ))}
        <li
          onClick={() => {
            if (page + 1 <= count) {
              onPageChange(page + 1);
            }
          }}
        >
          <div className="flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            {">"}
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
