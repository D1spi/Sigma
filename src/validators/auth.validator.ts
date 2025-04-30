// Defines Joi schemas for validating authentication-related requests.
// Ensures that incoming data adheres to the required structure and rules.

import Joi from 'joi';

export class AuthValidator {
  private static readonly email = Joi.string().email();
  private static readonly password = Joi.string();

  static readonly loginSchema = Joi.object({
    email: AuthValidator.email.required(),
    password: AuthValidator.password.required(),
  });
}
