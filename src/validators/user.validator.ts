// Defines Joi schemas for validating user-related requests.
// Ensures that incoming data adheres to the required structure and rules.

import Joi from 'joi';

export class UserValidator {
  private static readonly id = Joi.string();
  private static readonly email = Joi.string().email();
  private static readonly name = Joi.string().alphanum().min(3).max(30);
  private static readonly password = Joi.string();
  private static readonly birthday = Joi.date().iso();
  private static readonly isBlocked = Joi.boolean();
  private static readonly skip = Joi.number().min(1);
  private static readonly limit = Joi.number().min(1).max(100);

  static readonly userIdSchema = Joi.object({ id: UserValidator.id.required() });

  static readonly userPaginationSchema = Joi.object({
    skip: UserValidator.skip,
    limit: UserValidator.limit,
  }).with('skip', 'limit');

  static readonly userCreateSchema = Joi.object({
    name: UserValidator.name.required(),
    email: UserValidator.email.required(),
    password: UserValidator.password.required(),
    birthday: UserValidator.birthday.required(),
  });

  static readonly userUpdateSchema = Joi.object({
    name: UserValidator.name,
    email: UserValidator.email,
    password: UserValidator.password,
    birthday: UserValidator.birthday,
    isBlocked: UserValidator.isBlocked,
  });
}
