import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllEmployees } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { Employee, ApiResponse } from '../@types/employee.interface';
import { getImageUrl } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/PageContainer';
import { formatCurrency } from '../utils/currencyUtils';
import { ViewIcon, EditIcon, EmptyIcon, DeleteIcon } from '../icons';
import { ApiError } from '../@types/index.interface';
import ErrorHandling from '../components/Error';
import AddNew from '../components/AddNew';
import Pagination from '../components/Pagination';
import SelectField from '../components/SelectField';

const EmployeeList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getAllDepartments(),
  });

  const departments = departmentsData?.data || [];

  const { data, isLoading, error } = useQuery<ApiResponse<Employee[]>>({
    queryKey: ['employees', page, limit, filters],
    queryFn: () =>
      getAllEmployees({
        page,
        limit,
        status: filters.status || undefined,
        department: filters.department ? Number(filters.department) : undefined,
        search: filters.search || undefined,
      }),
  });

  const employees = data?.data || [];
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
      await import('../services/employeeService').then(({ deleteEmployee }) => deleteEmployee(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteId(null);
    },
    onError: (error: ApiError) => {
      setDeleteError(
        error?.response?.data?.message || error.message || 'Failed to delete employee.',
      );
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorHandling title="Employees" />;

  return (
    <PageContainer title="Employees" action={<AddNew title="Employee" route="/employees/new" />}>
      {/* Filters */}
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
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleSearchChange}
              title="Search by name, email or department..."
              placeholder="Search name, email or department..."
              className="mt-1 block w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col p-2">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sr. No.
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Profile
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Salary
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <span className="">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((employee: Employee, index: number) => (
                    <tr key={employee.id}>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.photo ? (
                          <img
                            src={getImageUrl(employee.photo) || ''}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.department_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatCurrency(employee.salary)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            employee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <ViewIcon className="mr-1.5 h-4 w-4" />
                            View
                          </Link>
                          <Link
                            to={`/employees/${employee.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <EditIcon className="mr-1.5 h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            className="inline-flex items-center text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => setDeleteId(employee.id)}
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
              {!employees.length && (
                <div className="text-center py-12">
                  <EmptyIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new employee.
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
            <p className="mb-4 text-gray-700">Are you sure you want to delete this employee?</p>
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
          hasItems={employees.length > 0}
        />
      )}
    </PageContainer>
  );
};

export default EmployeeList;
