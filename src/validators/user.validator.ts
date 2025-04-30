// Defines Joi schemas for validating user-related requests.
// Ensures that incoming data adheres to the required structure and rules.

import Joi from 'joi';

export class UserValidator {
  private static readonly id = Joi.string();
  private static readonly email = Joi.string().email().required().messages({
    'string.email': 'El correo electrónico debe tener un formato válido (contener @)',
    'any.required': 'El correo electrónico es obligatorio',
  });
  private static readonly name = Joi.string()
    .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'El nombre solo puede contener letras',
      'any.required': 'El nombre es obligatorio',
    });
  private static readonly lastname = Joi.string()
    .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Los apellidos solo pueden contener letras',
      'any.required': 'Los apellidos son obligatorios',
    });
  private static readonly password = Joi.string()
    .min(5)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])/)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 5 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula y una minúscula',
      'any.required': 'La contraseña es obligatoria',
    });
  private static readonly confirmPassword = Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas deben coincidir',
    'any.required': 'La confirmación de contraseña es obligatoria',
  });
  private static readonly address = Joi.string().allow('').optional();
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
    name: UserValidator.name,
    lastname: UserValidator.lastname,
    email: UserValidator.email,
    password: UserValidator.password,
    confirmPassword: UserValidator.confirmPassword,
    address: UserValidator.address,
  });
}
