// Utility functions for handling password-related operations.
// Includes functionalities like hashing passwords and comparing hashed passwords.
// Designed to ensure consistency and security across the application.

import bcrypt from 'bcrypt';

export class PasswordHelper {
  static readonly hashPassword = (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  };

  static readonly comparePasswords = (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
  };
}
