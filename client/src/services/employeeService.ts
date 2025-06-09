import axios from 'axios';
import processEnvConfig from '../config/processEnv.config';
import {
  ApiResponse,
  Employee,
  EmployeeFilters,
  EmployeeResponse,
  EmployeeStats,
  PaginationParams,
} from '../@types/employee.interface';

const API_URL = processEnvConfig.API_URL;
export const getAllEmployees = async (
  params?: PaginationParams,
): Promise<ApiResponse<Employee[]>> => {
  const response = await axios.get<ApiResponse<Employee[]>>(`${API_URL}/employees`, {
    params,
  });
  return response.data;
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await axios.get<ApiResponse<Employee>>(`${API_URL}/employees/${id}`);
  return response.data.data;
};

export const createEmployee = async (employee: FormData): Promise<Employee> => {
  const response = await axios.post<ApiResponse<Employee>>(`${API_URL}/employees`, employee);
  return response.data.data;
};

export const updateEmployee = async ({
  id,
  formData,
}: {
  id: number;
  formData: FormData;
}): Promise<Employee> => {
  const response = await axios.put<ApiResponse<Employee>>(`${API_URL}/employees/${id}`, formData);
  return response.data.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/employees/${id}`);
};

export const getEmployeeStats = async (): Promise<EmployeeStats> => {
  const response = await axios.get(`${API_URL}/employees/stats`);
  return response.data;
};

const employeeService = {
  getAll: async (filters: EmployeeFilters): Promise<EmployeeResponse> => {
    const response = await axios.get(`${API_URL}/employees`, { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await axios.get(`${API_URL}/employees/${id}`);
    return response.data;
  },

  getStats: async (): Promise<EmployeeStats> => {
    const response = await axios.get(`${API_URL}/employees/stats`);
    return response.data;
  },
};

export default employeeService;
