import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { createDepartmentService, getDepartmentsService } from '../services/department.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import MESSAGE from '../constants/messages.constant';

interface Department extends RowDataPacket {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  employee_count: number;
}

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const result = await createDepartmentService(req.body);
    sendResponse({
      res,
      success: true,
      statusCode: 201,
      data: result,
      message: MESSAGE.SUCCESS.DEPARTMENTS.CREATED,
    });
  } catch (error) {
    console.error('Error creating departments:', error);
    sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: error.message || MESSAGE.ERROR.DEPARTMENTS.CREATED,
    });
  }
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      status: req.query.status as string,
      search: req.query.search as string,
    };
    const result = await getDepartmentsService(filters);

    res.json({
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      statusCode: 200,
      message: MESSAGE.SUCCESS.DEPARTMENTS.FETCHED,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.DEPARTMENTS.FETCHED,
      statusCode: 500,
    });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<Department[]>(
      `
      SELECT 
        d.id,
        d.name,
        d.status,
        COALESCE(COUNT(e.id), 0) as employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      WHERE d.id = ?
      GROUP BY d.id, d.name, d.status
    `,
      [req.params.id],
    );
    if (!rows.length) {
      sendResponse({
        res,
        success: false,
        message: MESSAGE.ERROR.DEPARTMENTS.NOT_FOUND,
        statusCode: 404,
      });
      return;
    }
    const department = { ...rows[0], employee_count: Number(rows[0].employee_count) };
    sendResponse({
      res,
      success: true,
      data: department,
      statusCode: 200,
      message: MESSAGE.SUCCESS.DEPARTMENTS.FETCHED,
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.DEPARTMENTS.FETCHED,
      statusCode: 500,
    });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const [existingDepartment] = await pool.query<Department[]>(
      'SELECT * FROM departments WHERE id = ?',
      [req.params.id],
    );
    if (!existingDepartment.length) {
      sendResponse({
        res,
        success: false,
        message: MESSAGE.ERROR.DEPARTMENTS.NOT_FOUND,
        statusCode: 404,
      });
      return;
    }
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    if (req.body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(req.body.name);
    }
    if (req.body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(req.body.status);
    }
    if (!updateFields.length) {
      sendResponse({
        res,
        success: false,
        message: 'No fields to update',
        statusCode: 400,
      });
      return;
    }
    updateValues.push(req.params.id);
    await pool.query<ResultSetHeader>(
      `UPDATE departments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    );
    const [updatedDepartment] = await pool.query<Department[]>(
      'SELECT * FROM departments WHERE id = ?',
      [req.params.id],
    );
    if (!updatedDepartment.length) {
      sendResponse({
        res,
        success: false,
        message: MESSAGE.ERROR.DEPARTMENTS.UPDATED,
        statusCode: 500,
      });
      return;
    }
    sendResponse({
      res,
      success: true,
      message: MESSAGE.SUCCESS.DEPARTMENTS.UPDATED,
      data: updatedDepartment[0],
      statusCode: 200,
    });
  } catch (error: any) {
    console.error('Error updating department:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.DEPARTMENTS.UPDATED,
      statusCode: 500,
    });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM departments WHERE id = ?', [
      req.params.id,
    ]);
    sendResponse({
      res,
      success: true,
      message: MESSAGE.SUCCESS.DEPARTMENTS.DELETED,
      data: result,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.DEPARTMENTS.DELETED,
      statusCode: 500,
    });
  }
};
