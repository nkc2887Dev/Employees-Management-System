import pool from '../config/database';
import { DepartmentFilters, Department } from '../@types/department.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getDepartmentsService = async (filters: DepartmentFilters) => {
  try {
    const { status, search, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `
        FROM departments d
        LEFT JOIN (
          SELECT department_id, COUNT(*) as emp_count
          FROM employees
          GROUP BY department_id
        ) e ON d.id = e.department_id
        WHERE 1=1
      `;
    const params: any[] = [];

    if (status) {
      baseQuery += ' AND d.status = ?';
      params.push(status);
    }

    if (search) {
      baseQuery += ' AND d.name LIKE ?';
      params.push(`%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countResult[0].total;

    const dataQuery = `
        SELECT 
          d.*,
          COALESCE(e.emp_count, 0) as employee_count
        ${baseQuery}
        ORDER BY d.id DESC
        LIMIT ? OFFSET ?
      `;

    const dataParams = [...params, limit, offset];
    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, dataParams);

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error in getDepartments service:', error);
    const err: any = new Error('Failed to fetch departments');
    err.statusCode = 500;
    throw err;
  }
};

export const getDepartmentByIdService = async (id: number): Promise<Department | null> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM departments WHERE id = ?', [id]);
  return (rows[0] as Department) || null;
};

export const createDepartmentService = async (
  data: Omit<Department, 'id' | 'created_at' | 'modified_at'>,
): Promise<Department> => {
  const [result] = await pool.query<ResultSetHeader>('INSERT INTO departments SET ?', data);
  return getDepartmentByIdService(result.insertId) as Promise<Department>;
};
