import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validateRequest = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body };
      if (data.department_id) {
        data.department_id = Number(data.department_id);
      }
      if (data.salary) {
        data.salary = Number(data.salary);
      }

      const { error } = schema.validate(data, { abortEarly: false });
      if (error) {
        throw new Error(error.details[0].message);
      }

      next();
    } catch (error) {
      if (error instanceof Error) {
        next(Object.assign(new Error(error.message), { statusCode: 400 }));
      } else {
        next(new Error('Validation error'));
      }
    }
  };
};
