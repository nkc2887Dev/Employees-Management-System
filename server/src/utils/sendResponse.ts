import { SendResponseParams } from '../@types/index.interface';

export const sendResponse = ({
  res,
  success,
  message = 'something went wrong',
  data = {},
  statusCode = 200,
}: SendResponseParams): void => {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};
