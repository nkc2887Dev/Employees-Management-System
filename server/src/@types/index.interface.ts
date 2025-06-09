import { Response } from 'express';

export interface SendResponseParams {
  res: Response;
  success: boolean;
  message?: string;
  data?: any;
  statusCode?: number;
}
