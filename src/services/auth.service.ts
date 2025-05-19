// Implements business logic for authorization operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { ApplicationError } from '../utils/application.error';
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
      throw new ApplicationError('User not found', httpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      logger.warn(`AuthService: User with email ${email} is blocked`);
      throw new ApplicationError('User is blocked', httpStatus.FORBIDDEN);
    }
    const isPasswordValid = await PasswordHelper.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`AuthService: Invalid password for email: ${email}`);
      throw new ApplicationError('Invalid password', httpStatus.UNAUTHORIZED);
    }
    const token = TokenHelper.generateToken({ id: user.id });
    logger.info(`AuthService: Login successful for email: ${email}`);
<<<<<<< Updated upstream
    return { ...user, token };
=======
    return {
      ...user,
      authToken,
      refreshToken,
    };
  };

  logout = async (userId: string): Promise<void> => {
    logger.debug(`AuthService: Logging out user with id ${userId}`);

    // Verificamos que el usuario existe
    const projection = { ...this.defaultProjection };
    const user = await this.userRepository.getById(userId, projection);

    if (!user) {
      logger.warn(`AuthService: User not found for id: ${userId}`);
      throw new ApplicationError('User not found', httpStatus.NOT_FOUND);
    }

    // Creamos un objeto parcial para actualizar solo el campo tokensValid
    const updateData = {
      tokensValid: false,
      name: user.name, // Mantenemos los campos obligatorios del modelo
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    } as IUser;

    // Marcamos los tokens como inválidos pero no los borramos
    const updateProjection = { ...this.defaultProjection, tokensValid: true };
    await this.userRepository.update(userId, updateData, updateProjection);

    logger.info(`AuthService: User ${userId} logged out successfully`);
>>>>>>> Stashed changes
  };
}
