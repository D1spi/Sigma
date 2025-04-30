// Defines the routes for user-related operations.
// Maps HTTP methods and endpoints to the corresponding controller methods.

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserValidator } from '../validators/user.validator';
import { validate, ValidationSource } from '../middlewares/validate.middleware';
import { checkToken } from '../middlewares/auth.middleware';

const userController = new UserController();
export const userRouter = Router();

userRouter.get('/:id', validate(UserValidator.userIdSchema, ValidationSource.PARAMS), userController.getById);
userRouter.get('/', validate(UserValidator.userPaginationSchema, ValidationSource.QUERY), userController.getAll);
userRouter.post('/', validate(UserValidator.userCreateSchema, ValidationSource.BODY), userController.create);
userRouter.put(
  '/:id',
  validate(UserValidator.userIdSchema, ValidationSource.PARAMS),
  validate(UserValidator.userUpdateSchema, ValidationSource.BODY),
  userController.update,
);
userRouter.delete(
  '/:id',
  checkToken,
  validate(UserValidator.userIdSchema, ValidationSource.PARAMS),
  userController.delete,
);
