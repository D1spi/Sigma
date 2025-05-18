import { Request } from 'express';

export interface AuthUserDto {
  id?: string;
  name?: string;
  lastname?: string;
  email: string;
  password: string;
  isBlocked?: boolean;
  authToken?: string;
  refreshToken?: string;
  tokensValid?: boolean;
  token?: string; // Campo antiguo, mantener por compatibilidad
}

// Extendemos la interfaz Request para incluir el usuario autenticado
export interface IAuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}
