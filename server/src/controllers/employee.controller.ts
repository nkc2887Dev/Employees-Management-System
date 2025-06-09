import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { createConnection } from '../config/db.config';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getEmployees } from '../services/employee.service';
import path from 'path';
import fs from 'fs';

interface Employee extends RowDataPacket {
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

const getPhotoUrl = (photoFileName: string | null): string | null => {
  if (!photoFileName) return null;
  return `/uploads/${photoFileName}`;
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const conn = await createConnection();
    const [existingEmployees] = await conn.execute<Employee[]>(
      'SELECT id FROM employees WHERE email = ?',
      [req.body.email],
    );
    if (existingEmployees.length > 0) {
      await conn.end();
      sendResponse({
        res,
        success: false,
        message: 'Email already exists',
        statusCode: 400,
      });
      return;
    }
    const [departments] = await conn.execute<Employee[]>(
      'SELECT id FROM departments WHERE id = ?',
      [req.body.department_id],
    );
    if (!departments.length) {
      await conn.end();
      sendResponse({
        res,
        success: false,
        message: 'Invalid department ID',
        statusCode: 400,
      });
      return;
    }

    let photoFileName = null;
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      photoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;

      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, photoFileName);
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const { name, email, phone, dob, department_id, salary, status } = req.body;
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO employees (name, email, phone, dob, department_id, salary, status, photo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, dob, department_id, salary, status, photoFileName],
    );

    const [employees] = await conn.execute<Employee[]>('SELECT * FROM employees WHERE id = ?', [
      result.insertId,
    ]);
    await conn.end();

    if (!employees.length) {
      if (photoFileName) {
        const filePath = path.join(__dirname, '../uploads', photoFileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      sendResponse({
        res,
        success: false,
        message: 'Failed to create employee',
        statusCode: 500,
      });
      return;
    }

    const employeeWithPhotoUrl = {
      ...employees[0],
      photo: getPhotoUrl(photoFileName),
    };

    sendResponse({
      res,
      success: true,
      message: 'Employee created successfully',
      data: employeeWithPhotoUrl,
      statusCode: 201,
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    sendResponse({
      res,
      success: false,
      message:
        error.code === 'ER_DUP_ENTRY'
          ? 'Email already exists'
          : error.message || 'Failed to create employee',
      statusCode: error.code === 'ER_DUP_ENTRY' ? 400 : 500,
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      status: req.query.status as string,
      department: parseInt(req.query.department as string),
      search: req.query.search as string,
    };
    const result = await getEmployees(filters);
    res.json({
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      statusCode: 200,
      message: 'Employees fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    sendResponse({
      res,
      success: false,
      message: 'Failed to fetch employees',
      statusCode: 500,
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const conn = await createConnection();
    const [rows] = await conn.execute<Employee[]>('SELECT * FROM employees WHERE id = ?', [
      req.params.id,
    ]);
    await conn.end();
    if (!rows.length) {
      sendResponse({
        res,
        success: false,
        message: 'Employee not found',
        statusCode: 404,
      });
      return;
    }

    const employeeWithPhotoUrl = {
      ...rows[0],
      photo: getPhotoUrl(rows[0].photo || null),
    };

    sendResponse({
      res,
      success: true,
      data: employeeWithPhotoUrl,
      statusCode: 200,
      message: 'Employee fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    sendResponse({
      res,
      success: false,
      message: 'Failed to fetch employee',
      statusCode: 500,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const conn = await createConnection();
    const [existingEmployee] = await conn.execute<Employee[]>(
      'SELECT * FROM employees WHERE id = ?',
      [req.params.id],
    );
    if (!existingEmployee.length) {
      await conn.end();
      sendResponse({
        res,
        success: false,
        message: 'Employee not found',
        statusCode: 404,
      });
      return;
    }

    let photoFileName = existingEmployee[0].photo;

    if (req.file) {
      if (existingEmployee[0].photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads', existingEmployee[0].photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const fileExt = path.extname(req.file.originalname);
      photoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;

      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, photoFileName);
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const { email, ...updateData } = req.body;
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(updateData.phone);
    }
    if (updateData.dob !== undefined) {
      updateFields.push('dob = ?');
      updateValues.push(updateData.dob);
    }
    if (updateData.department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(updateData.department_id);
    }
    if (updateData.salary !== undefined) {
      updateFields.push('salary = ?');
      updateValues.push(updateData.salary);
    }
    if (updateData.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updateData.status);
    }

    if (req.file) {
      updateFields.push('photo = ?');
      updateValues.push(photoFileName);
    }

    if (!updateFields.length) {
      await conn.end();
      sendResponse({
        res,
        success: false,
        message: 'No fields to update',
        statusCode: 400,
      });
      return;
    }

    updateValues.push(req.params.id);
    await conn.execute<ResultSetHeader>(
      `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    );

    const [updatedEmployee] = await conn.execute<Employee[]>(
      'SELECT * FROM employees WHERE id = ?',
      [req.params.id],
    );
    await conn.end();

    const employeeWithPhotoUrl = {
      ...updatedEmployee[0],
      photo: getPhotoUrl(updatedEmployee[0].photo || null),
    };

    sendResponse({
      res,
      success: true,
      message: 'Employee updated successfully',
      data: employeeWithPhotoUrl,
      statusCode: 200,
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || 'Failed to update employee',
      statusCode: 500,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const conn = await createConnection();
    const [result] = await conn.execute<ResultSetHeader>('DELETE FROM employees WHERE id = ?', [
      req.params.id,
    ]);
    await conn.end();
    sendResponse({
      res,
      success: true,
      message: 'Employee deleted successfully',
      data: result,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse({
      res,
      success: false,
      message: 'Failed to delete employee',
      statusCode: 500,
    });
  }
};

export const getEmployeeStats = async (_req: Request, res: Response) => {
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
    const result = {
      departmentHighestSalary: departmentHighestSalary || [],
      salaryRangeCount: salaryRangeCount || [],
      youngestByDepartment: youngestByDepartment || [],
    };
    sendResponse({
      res,
      success: true,
      data: result,
      statusCode: 200,
      message: 'Employee statistics fetched successfully',
    });
  } catch (error: any) {
    console.error('Error in getEmployeeStats:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || 'Failed to fetch employee statistics',
      statusCode: 500,
    });
  }
};
