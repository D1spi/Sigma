// Defines the structure of a User object using a TypeScript interface.
// Ensures type safety throughout the application when working with users.

export interface IUser {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  address?: string;
  birthday?: Date;
  isBlocked?: boolean;
  authToken?: string;
  refreshToken?: string;
  tokensValid?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
}
