// Implements business logic for user operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
// For PostgreSQL with Prisma uncomment the following line and comment the previous one
// import { UserRepository } from '../repositories/user.repository.prisma';
import { PasswordHelper } from '../utils/password.helper';
import { IUser } from '../interfaces/user.interface';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      email: true,
      password: false,
      birthday: true,
      isBlocked: true,
      createdAt: false,
      updatedAt: false,
    };
  }

  private readonly normalizeUserData = (data: IUser): IUser => {
    const normalizedData = { ...data };
    if (data.name && typeof data.name === 'string') {
      normalizedData.name = data.name.trim();
    }
    if (data.email && typeof data.email === 'string') {
      normalizedData.email = data.email.toLowerCase().trim();
    }
    if (data.password && typeof data.password === 'string') {
      normalizedData.password = data.password.trim();
    }
    if (data.birthday && typeof data.birthday === 'string') {
      normalizedData.birthday = new Date(data.birthday);
    }
    if (data.isBlocked && typeof data.isBlocked === 'string') {
      normalizedData.isBlocked = data.isBlocked === 'true';
    }
    logger.debug({ normalizedData }, 'Normalized user data');
    return normalizedData;
  };

  private readonly getAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    logger.debug({ birthday, age }, 'Calculated age');
    return age;
  };

  private readonly validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{5,30}$/;
    const isValid = passwordRegex.test(password);
    if (!isValid) {
      logger.warn('Password validation failed. Provided password does not meet the required complexity.');
      throw new AppError(
        'Password must be between 5 to 30 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        httpStatus.BAD_REQUEST,
      );
    }
    logger.debug('Password validated successfully');
    return true;
  };

  getById = async (id: string): Promise<IUser> => {
    const projection = { ...this.defaultProjection };
    const user = await this.userRepository.getById(id, projection);
    if (!user) {
      logger.warn(`User with id ${id} not found`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      logger.warn(`User with id ${id} is blocked`);
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }
    logger.info(`User with id ${id} retrieved successfully`);
    return user;
  };

  getAll = (pagination: { skip: number; limit: number }): Promise<(IUser | null)[]> => {
    const MAX_LIMIT = 100;
    if (pagination.limit === 0 || pagination.limit > MAX_LIMIT) {
      pagination.limit = MAX_LIMIT;
      logger.debug('Pagination limit adjusted to MAX_LIMIT', { pagination });
    }
    const filters = {};
    const projection = { ...this.defaultProjection };
    logger.debug(
      `Fetching all users with filters: ${JSON.stringify(filters)} and pagination: ${JSON.stringify(pagination)}`,
    );
    return this.userRepository.find(filters, projection, pagination);
  };

  create = async (data: IUser): Promise<IUser> => {
    const normalizedData = this.normalizeUserData(data);
    const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
    if (existingUser) {
      logger.warn(`User with email ${normalizedData.email} already exists`);
      throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
    }
    if (this.getAge(normalizedData.birthday) < 18) {
      logger.warn('User is under 18 years old', { birthday: normalizedData.birthday });
      throw new AppError('User must be at least 18 years old', httpStatus.BAD_REQUEST);
    }
    this.validatePassword(normalizedData.password);
    normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);
    const projection = { ...this.defaultProjection, isBlocked: false };
    const createdUser = await this.userRepository.create(normalizedData, projection);
    if (!createdUser) {
      logger.warn('User creation failed');
      throw new AppError('User creation failed', httpStatus.INTERNAL_SERVER_ERROR);
    }
    logger.info(`User created successfully with email ${normalizedData.email}`);
    return createdUser;
  };

  update = async (id: string, data: IUser): Promise<IUser> => {
    logger.debug(`Starting update for user id: ${id}`, { requestData: data });
    const userToUpdate = await this.userRepository.getById(id, this.defaultProjection);
    if (!userToUpdate) {
      logger.warn(`User with id ${id} not found for update`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (userToUpdate.isBlocked) {
      logger.warn(`User with id ${id} is blocked and cannot be updated`);
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }

    const normalizedData = this.normalizeUserData(data);
    if (this.getAge(normalizedData.birthday) < 18) {
      logger.warn('User is under 18 years old', { birthday: normalizedData.birthday });
      throw new AppError('User must be at least 18 years old', httpStatus.BAD_REQUEST);
    }
    if (normalizedData.email) {
      const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
      if (existingUser?.id && existingUser?.id.toString() !== id) {
        logger.warn(`Another user with email ${normalizedData.email} already exists`);
        throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
      }
    }
    if (normalizedData.password) {
      this.validatePassword(normalizedData.password);
      normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);
    }
    const projection = { ...this.defaultProjection };
    const userUpdated = await this.userRepository.update(id, normalizedData, projection);
    if (!userUpdated) {
      logger.warn(`User with id ${id} not found after update attempt`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    logger.info(`User with id ${id} updated successfully`);
    return userUpdated;
  };

  delete = async (id: string): Promise<IUser> => {
    logger.debug(`Starting deletion for user id: ${id}`);
    const projection = { ...this.defaultProjection };
    const userDeleted = await this.userRepository.delete(id, projection);
    if (!userDeleted) {
      logger.warn(`User with id ${id} not found for deletion`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    logger.info(`User with id ${id} deleted successfully`);
    return userDeleted;
  };
}
