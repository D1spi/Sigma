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
