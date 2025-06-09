export interface Department {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  employee_count?: number;
}

export interface DepartmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DepartmentInput = Omit<Department, 'id' | 'employee_count'>;

export interface ApiResponse<T> {
  message: string;
  data: T;
}
