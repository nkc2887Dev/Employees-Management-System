import pool from '../config/database';
import { EmployeeFilters } from '../@types/employee.interface';
import { RowDataPacket } from 'mysql2';

export const getEmployees = async (filters: EmployeeFilters) => {
  try {
    const { status, department, search, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE 1=1
      `;
    const params: any[] = [];

    if (status) {
      baseQuery += ' AND e.status = ?';
      params.push(status);
    }

    if (department) {
      baseQuery += ' AND e.department_id = ?';
      params.push(department);
    }

    if (search) {
      baseQuery += ' AND (e.name LIKE ? OR e.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countResult[0].total;

    const dataQuery = `
        SELECT 
          e.*,
          d.name as department_name
        ${baseQuery}
        ORDER BY e.id DESC
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
    console.error('Error in getEmployees service:', error);
    const err: any = new Error('Failed to fetch employees');
    err.statusCode = 500;
    throw err;
  }
};
