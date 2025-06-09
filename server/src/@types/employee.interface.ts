import { RowDataPacket } from "mysql2";

export interface Employee {
  id: number;
  department_id: number;
  name: string;
  dob: string;
  phone: string;
  photo: string;
  email: string;
  salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  modified_at: string;
  department_name?: string;
}
export interface EmployeeRow extends RowDataPacket {
  id: number;
  department_id: number;
  department_name?: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  salary: number;
  status: 'active' | 'inactive';
  photo?: string;
}
export interface EmployeeFilters {
  status?: string;
  department?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeStats {
  departmentHighestSalary: {
    department: string;
    salary: number;
  }[];
  salaryRangeCount: {
    range: string;
    count: number;
  }[];
  youngestByDepartment: {
    department: string;
    name: string;
    age: number;
  }[];
}
