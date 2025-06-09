import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAllDepartments, deleteDepartment } from '../services/departmentService';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/PageContainer';
import debounce from 'lodash/debounce';
import { ViewIcon, EditIcon, EmptyIcon, DeleteIcon } from '../icons';
import ErrorHandling from '../components/Error';
import { ApiError } from '../@types/index.interface';
import AddNew from '../components/AddNew';
import Pagination from '../components/Pagination';
import SelectField from '../components/SelectField';

const DepartmentList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['departments', page, limit, filters],
    queryFn: () =>
      getAllDepartments({
        page,
        limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
      }),
  });

  const departments = data?.data || [];
  const pagination = data?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeleteError('');
      await deleteDepartment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteId(null);
    },
    onError: (error: ApiError) => {
      setDeleteError(
        error?.response?.data?.message || error.message || 'Failed to delete department.',
      );
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorHandling title="Departments" />;

  return (
    <PageContainer
      title="Departments"
      action={<AddNew title="Department" route="/departments/new" />}
    >
      <div className="mb-4 p-4 flex justify-between items-center">
        <div className="flex gap-4">
          <SelectField
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div>
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search department name..."
              className="mt-1 block w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col p-2">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {departments.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Sr.No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Employee Count
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departments.map((department, index) => (
                      <tr key={department.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {(page - 1) * limit + index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{department.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              department.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-1">
                              {department.employee_count}
                            </span>
                            <span className="text-sm text-gray-500">
                              {department.employee_count === 1 ? 'employee' : 'employees'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/departments/${department.id}`}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            >
                              <ViewIcon className="mr-1.5 h-4 w-4" />
                              View
                            </Link>
                            <Link
                              to={`/departments/${department.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            >
                              <EditIcon className="mr-1.5 h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              className="inline-flex items-center text-red-600 hover:text-red-800"
                              title="Delete"
                              onClick={() => setDeleteId(department.id)}
                            >
                              <DeleteIcon className="mr-1.5 h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <EmptyIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new department.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Confirm Delete</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this department?</p>
            {deleteError && <div className="mb-2 text-red-600 text-sm">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          hasItems={departments.length > 0}
        />
      )}
    </PageContainer>
  );
};

export default DepartmentList;
