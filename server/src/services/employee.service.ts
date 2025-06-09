import { ResultSetHeader,RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import { EmployeeFilters, EmployeeRow } from '../@types/employee.interface';
import { createConnection } from '../config/db.config';
import { getPhotoUrl } from './common.service';
import MESSAGE from '../constants/messages.constant';

export const createEmployeeService = async (body: any, file?: Express.Multer.File) => {
  const conn = await createConnection();

  const [existingEmployees] = await conn.execute<EmployeeRow[]>(
    'SELECT id FROM employees WHERE email = ?',
    [body.email]
  );
  if (existingEmployees.length > 0) {
    await conn.end();
    return { error: MESSAGE.SUCCESS.EMPLOYEES.ALREADY_EXISTS, status: 400 };
  }

  const [departments] = await conn.execute<EmployeeRow[]>(
    'SELECT id FROM departments WHERE id = ?',
    [body.department_id]
  );
  if (!departments.length) {
    await conn.end();
    return { error: MESSAGE.ERROR.DEPARTMENTS.INVALID_ID, status: 400 };
  }

  let photoFileName: string | null = null;
  if (file) {
    const fileExt = path.extname(file.originalname);
    photoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, photoFileName);
    fs.writeFileSync(filePath, file.buffer);
  }

  const { name, email, phone, dob, department_id, salary, status } = body;
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO employees (name, email, phone, dob, department_id, salary, status, photo) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, dob, department_id, salary, status, photoFileName]
  );

  const [employees] = await conn.execute<EmployeeRow[]>(
    'SELECT * FROM employees WHERE id = ?',
    [result.insertId]
  );

  await conn.end();

  if (!employees.length) {
    if (photoFileName) {
      const filePath = path.join(__dirname, '../../uploads', photoFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return { error: MESSAGE.ERROR.EMPLOYEES.CREATED, status: 500 };
  }

  return {
    data: {
      ...employees[0],
      photo: photoFileName,
    },
    status: 201,
  };
};

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
    const err: any = new Error(error.message || MESSAGE.ERROR.EMPLOYEES.FETCHED);
    err.statusCode = 500;
    throw err;
  }
};

export const updateEmployeeService = async (id: string, body: any, file?: Express.Multer.File) => {
  const conn = await createConnection();

  try {
    const [existingEmployee] = await conn.execute<EmployeeRow[]>(
      'SELECT * FROM employees WHERE id = ?',
      [id],
    );

    if (!existingEmployee.length) {
      await conn.end();
      return { status: 404, success: false, message: MESSAGE.ERROR.EMPLOYEES.NOT_FOUND };
    }

    let photoFileName = existingEmployee[0].photo;

    if (file) {
      if (photoFileName) {
        const oldPhotoPath = path.join(__dirname, '../uploads', photoFileName);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }

      const fileExt = path.extname(file.originalname);
      photoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      const uploadsDir = path.join(__dirname, '../uploads');

      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, photoFileName);
      fs.writeFileSync(filePath, file.buffer);
    }

    const { email, ...updateData } = body;
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.name) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.phone) {
      updateFields.push('phone = ?');
      updateValues.push(updateData.phone);
    }
    if (updateData.dob) {
      updateFields.push('dob = ?');
      updateValues.push(updateData.dob);
    }
    if (updateData.department_id) {
      updateFields.push('department_id = ?');
      updateValues.push(updateData.department_id);
    }
    if (updateData.salary) {
      updateFields.push('salary = ?');
      updateValues.push(updateData.salary);
    }
    if (updateData.status) {
      updateFields.push('status = ?');
      updateValues.push(updateData.status);
    }

    if (file) {
      updateFields.push('photo = ?');
      updateValues.push(photoFileName);
    }

    if (!updateFields.length) {
      await conn.end();
      return { status: 400, success: false, message: 'No fields to update' };
    }

    updateValues.push(id);
    await conn.execute<ResultSetHeader>(
      `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    );

    const [updatedEmployee] = await conn.execute<EmployeeRow[]>(
      'SELECT * FROM employees WHERE id = ?',
      [id],
    );

    const employeeWithPhotoUrl = {
      ...updatedEmployee[0],
      photo: getPhotoUrl(updatedEmployee[0].photo || null),
    };

    await conn.end();

    return {
      status: 200,
      success: true,
      message:  MESSAGE.SUCCESS.EMPLOYEES.UPDATED,
      data: employeeWithPhotoUrl,
    };
  } catch (error: any) {
    await conn.end();
    throw new Error(error.message || MESSAGE.ERROR.EMPLOYEES.UPDATED);
  }
};

export const getEmployeeStatsServic = async () => {
  try {
    const conn = await createConnection();
    const [departmentHighestSalary] = await conn.execute<RowDataPacket[]>(
      `
          SELECT 
            d.name as department, 
            MAX(e.salary) as salary
          FROM departments d
          LEFT JOIN employees e ON e.department_id = d.id
          GROUP BY d.id, d.name
          ORDER BY salary DESC
        `,
    );
    const [salaryRangeCount] = await conn.execute<RowDataPacket[]>(
      `
          SELECT 
            CASE
              WHEN salary <= 50000 THEN '0-50000'
              WHEN salary > 50000 AND salary <= 100000 THEN '50001-100000'
              ELSE '100000+'
            END as \`range\`,
            COUNT(*) as count
          FROM employees
          GROUP BY 
            CASE
              WHEN salary <= 50000 THEN '0-50000'
              WHEN salary > 50000 AND salary <= 100000 THEN '50001-100000'
              ELSE '100000+'
            END
          ORDER BY 
            CASE \`range\`
              WHEN '0-50000' THEN 1
              WHEN '50001-100000' THEN 2
              ELSE 3
            END
        `,
    );
    const [youngestByDepartment] = await conn.execute<RowDataPacket[]>(
      `
          SELECT 
            d.name as department,
            e.name,
            TIMESTAMPDIFF(YEAR, e.dob, CURDATE()) as age
          FROM departments d
          LEFT JOIN employees e ON e.department_id = d.id
          WHERE (e.department_id, e.dob) IN (
            SELECT 
              department_id,
              MAX(dob) as max_dob
            FROM employees
            GROUP BY department_id
          ) OR e.id IS NULL
          ORDER BY d.name
        `,
    );
    await conn.end();
    return {
      departmentHighestSalary: departmentHighestSalary || [],
      salaryRangeCount: salaryRangeCount || [],
      youngestByDepartment: youngestByDepartment || [],
    };
  } catch (error) {
    console.error('Error in getEmployees service:', error);
    const err: any = new Error( error.message || MESSAGE.ERROR.EMPLOYEES.FETCHED);
    err.statusCode = 500;
    throw err;
  }
};