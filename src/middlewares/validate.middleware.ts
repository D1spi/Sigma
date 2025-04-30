// Middleware to validate request payloads using Joi schemas.
// Ensures that incoming requests meet the required structure and data types.

import { RequestHandler, type NextFunction, type Request, type Response } from 'express';
import type Joi from 'joi';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';

export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
}

export const validate = <ReqParams, ReqBody, ReqQuery>(
  schema: Joi.ObjectSchema,
  source: ValidationSource,
): RequestHandler<ReqParams, unknown, ReqBody, ReqQuery> => {
  return (req: Request<ReqParams, never, ReqBody, ReqQuery>, res: Response, next: NextFunction): void => {
    logger.debug(`Validation middleware: Validating request ${source}`, { data: req[source] });

    const objToValidate: ReqParams | ReqBody | ReqQuery = req[source];
    if (!objToValidate) {
      logger.warn(`Validation middleware: No data found in request ${source}`);
      next(new Error('Validation type not supported'));
      return;
    }
    const result = schema.validate(objToValidate, { abortEarly: false });
    if (result.error) {
      logger.warn('Validation middleware: Validation errors', {
        errors: result.error.details.map((detail) => detail.message),
      });
      const responseObj = { msg: result.error.details.map((detail) => detail.message) };
      res.status(httpStatus.BAD_REQUEST).send(responseObj);
    } else {
      logger.debug('Validation middleware: Validation successful');
      next();
    }
  };
};
