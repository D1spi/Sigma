// Handles direct data operations related to users.
// This layer interacts with the database or a data source to perform CRUD operations.

import logger from '../config/logger';
import { IUserModel, UserModel } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { AuthUserDto } from '../interfaces/authUser.interface';
import { BaseRepository } from './base.repository';

export class UserRepository {
  private readonly baseRepository: BaseRepository<IUserModel>;

  constructor() {
    this.baseRepository = new BaseRepository(UserModel);
  }

  private transformId(user: IUserModel): IUser {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { _id, ...rest } = userObj;
    return { ...rest, id: _id.toString() };
  }

  private mapProjection(projection: Record<string, boolean>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(projection)
        .filter(([, value]) => value === false)
        .map(([key]) => [key, 0]),
    );
  }

  getById = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    logger.debug(`Repository: Fetching user by id: ${id}`);
    const userFound = await this.baseRepository.getById(id, this.mapProjection(projection));
    if (!userFound) {
      logger.debug(`Repository: No user found with id: ${id}`);
      return null;
    }
    const transformedUser = this.transformId(userFound);
    logger.debug(`Repository: User with id ${id} fetched and transformed`);
    return transformedUser;
  };

  find = async (
    filters: Record<string, unknown> = {},
    projection: Record<string, boolean> = {},
    pagination: { skip: number; limit: number } = { skip: 0, limit: 0 },
  ): Promise<IUser[]> => {
    const options = { ...pagination };
    logger.debug(
      `Repository: Finding users with filters: ${JSON.stringify(filters)} and pagination: ${JSON.stringify(pagination)}`,
    );
    const users = await this.baseRepository.find<IUserModel>(filters, this.mapProjection(projection), options);
    logger.debug(`Repository: Found ${users.length} users`);
    return users.map((user) => this.transformId(user));
  };

  create = async (data: IUser, projection: Record<string, boolean>): Promise<IUser | null> => {
    logger.debug('Repository: Creating user with data', { data });
    const createdUser = await this.baseRepository.create(data);
    if (!createdUser) {
      logger.debug('Repository: User creation returned null');
      return null;
    }
    const transformedUser = this.transformId(createdUser);
    const filteredUser = Object.fromEntries(
      Object.entries(transformedUser).filter(([field]) => projection[field] !== false),
    );
    logger.debug('Repository: User created and transformed', { user: filteredUser });
    return filteredUser as IUser;
  };

  getByEmail = async (email: string, projection: Record<string, boolean>): Promise<AuthUserDto | null> => {
    logger.debug(`Repository: Fetching user by email: ${email}`);
    const filters = { email };
    const userFound = await this.baseRepository.findOne(filters, this.mapProjection(projection));
    if (!userFound) {
      logger.debug(`Repository: No user found with email: ${email}`);
      return null;
    }
    const transformedUser = this.transformId(userFound);
    logger.debug(`Repository: User with email ${email} fetched and transformed`);
    return transformedUser;
  };

  update = async (id: string, data: IUser, projection: Record<string, boolean>): Promise<IUser | null> => {
    logger.debug(`Repository: Updating user with id: ${id}`, { data });
    data.updatedAt = new Date();
    const updatedUser = await this.baseRepository.update(id, data, this.mapProjection(projection));
    if (!updatedUser) {
      logger.debug(`Repository: No user found to update with id: ${id}`);
      return null;
    }
    const transformedUser = this.transformId(updatedUser);
    logger.debug(`Repository: User with id ${id} updated and transformed`);
    return transformedUser;
  };

  delete = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    logger.debug(`Repository: Deleting user with id: ${id}`);
    const userDeleted = await this.baseRepository.delete(id, this.mapProjection(projection));
    if (!userDeleted) {
      logger.warn(`Repository: No user found to delete with id: ${id}`);
      return null;
    }
    const transformedUser = this.transformId(userDeleted);
    logger.debug(`Repository: User with id ${id} deleted and transformed`);
    return transformedUser;
  };
}
