export interface Employee {
  id: number;
  department_id: number;
  department_name: string;
  name: string;
  dob: string;
  phone: string;
  photo?: string;
  email: string;
  salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  modified_at: string;
}

export interface EmployeeFilters {
  status?: string;
  department?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeResponse {
  data: Employee[];
  total: number;
}

export interface EmployeeStats {
  data: {
    departmentHighestSalary: Array<{
      department: string;
      salary: number;
    }>;
    salaryRangeCount: Array<{
      range: string;
      count: number;
    }>;
    youngestByDepartment: Array<{
      department: string;
      name: string;
      age: number;
    }>;
  };
}

export interface EmployeeInput {
  name: string;
  email: string;
  phone: string;
  dob: string;
  department_id: number;
  salary: number;
  status: 'active' | 'inactive';
  photo?: string;
}

export type EmployeeUpdateInput = Partial<Omit<EmployeeInput, 'email'>>;

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  department?: number;
  search?: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: PaginationResponse;
}
