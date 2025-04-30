// Defines the structure of a User object using a TypeScript interface.
// Ensures type safety throughout the application when working with users.

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  birthday: Date;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
}
