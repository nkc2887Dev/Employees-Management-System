import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { createConnection } from '../config/db.config';
import { ResultSetHeader } from 'mysql2';
import { createEmployeeService, getEmployees, getEmployeeStatsServic, updateEmployeeService } from '../services/employee.service';
import MESSAGE from '../constants/messages.constant';
import { getPhotoUrl } from '../services/common.service';
import { EmployeeRow } from '../@types/employee.interface';

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const result = await createEmployeeService(req.body, req.file);

    if ('error' in result) {
      return sendResponse({
        res,
        success: false,
        message: result.error || MESSAGE.ERROR.EMPLOYEES.CREATED,
        statusCode: result.status || 400,
      });
    }

    const employeeWithPhotoUrl = {
      ...result.data,
      photo: getPhotoUrl(result.data.photo || null),
    };

    sendResponse({
      res,
      success: true,
      message: MESSAGE.SUCCESS.EMPLOYEES.CREATED,
      data: employeeWithPhotoUrl,
      statusCode: result.status,
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    sendResponse({
      res,
      success: false,
      message:
        error.code === 'ER_DUP_ENTRY'
          ? MESSAGE.SUCCESS.EMPLOYEES.ALREADY_EXISTS
          : error.message || MESSAGE.ERROR.EMPLOYEES.CREATED,
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
      message: MESSAGE.SUCCESS.EMPLOYEES.FETCHED,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.EMPLOYEES.FETCHED,
      statusCode: 500,
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const conn = await createConnection();
    const [rows] = await conn.execute<EmployeeRow[]>('SELECT * FROM employees WHERE id = ?', [
      req.params.id,
    ]);
    await conn.end();
    if (!rows.length) {
      sendResponse({
        res,
        success: false,
        message: MESSAGE.ERROR.EMPLOYEES.NOT_FOUND,
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
      message: MESSAGE.SUCCESS.EMPLOYEES.FETCHED,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.EMPLOYEES.FETCHED,
      statusCode: 500,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const result = await updateEmployeeService(req.params.id, req.body, req.file || undefined);

    sendResponse({
      res,
      ...result,
      message: result.message || (result.success ? MESSAGE.SUCCESS.EMPLOYEES.UPDATED : MESSAGE.ERROR.EMPLOYEES.UPDATED),
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.EMPLOYEES.UPDATED,
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
      message: MESSAGE.SUCCESS.EMPLOYEES.DELETED,
      data: result,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.EMPLOYEES.DELETED,
      statusCode: 500,
    });
  }
};

export const getEmployeeStats = async (_req: Request, res: Response) => {
  try {
    const result = await getEmployeeStatsServic();
    sendResponse({
      res,
      success: true,
      data: result,
      statusCode: 200,
      message: MESSAGE.SUCCESS.EMPLOYEES.STATS
    });
  } catch (error: any) {
    console.error('Error in getEmployeeStats:', error);
    sendResponse({
      res,
      success: false,
      message: error.message || MESSAGE.ERROR.EMPLOYEES.STATS,
      statusCode: 500,
    });
  }
};
