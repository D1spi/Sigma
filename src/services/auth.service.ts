// Implements business logic for authorization operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
// For PostgreSQL with Prisma uncomment the following line and comment the previous one
// import { UserRepository } from '../repositories/user.repository.prisma';
import { PasswordHelper } from '../utils/password.helper';
import { TokenHelper } from '../utils/token.helper';
import { AuthUserDto } from '../interfaces/authUser.interface';

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      email: true,
      password: false,
      birthday: false,
      isBlocked: true,
      createdAt: false,
      updatedAt: false,
    };
  }

  login = async (email: string, password: string): Promise<AuthUserDto> => {
    logger.debug(`AuthService: Attempting login for email: ${email}`);
    const projection = { ...this.defaultProjection, password: true };
    const user = await this.userRepository.getByEmail(email, projection);
    if (!user) {
      logger.warn(`AuthService: User not found for email: ${email}`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      logger.warn(`AuthService: User with email ${email} is blocked`);
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }
    const isPasswordValid = await PasswordHelper.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`AuthService: Invalid password for email: ${email}`);
      throw new AppError('Invalid password', httpStatus.UNAUTHORIZED);
    }
    const token = TokenHelper.generateToken({ id: user.id });
    logger.info(`AuthService: Login successful for email: ${email}`);
    return { ...user, token };
  };
}
