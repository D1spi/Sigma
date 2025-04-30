// A generic repository class providing common database operations.
// Can be extended by specific repositories like user.repository.ts.

import { Model, ProjectionFields } from 'mongoose';
import logger from '../config/logger';

export class BaseRepository<T> {
  private readonly model: Model<T>;
  private readonly defaultProjection: ProjectionFields<T>;

  constructor(model: Model<T>) {
    this.model = model;
    this.defaultProjection = { __v: 0 };
  }

  getById(id: string, projection?: ProjectionFields<T>): Promise<T | null> {
    const projectionFields = { ...projection, ...this.defaultProjection };
    logger.debug(`BaseRepository: getById called with id: ${id} and projection: ${JSON.stringify(projectionFields)}`);
    return this.model.findById(id, projectionFields);
  }

  find<Doctype>(
    filters: Record<string, unknown>,
    projection?: ProjectionFields<Doctype>,
    options?: Record<string, unknown>,
  ): Promise<T[]> {
    const projectionFields = { ...projection, ...this.defaultProjection };
    logger.debug(
      `BaseRepository: find called with filters: ${JSON.stringify(filters)}, projection: ${JSON.stringify(projectionFields)}, options: ${JSON.stringify(options)}`,
    );
    return this.model.find(filters, projectionFields, options || {});
  }

  async create(data: Partial<T>): Promise<T> {
    logger.debug(`BaseRepository: create called with data: ${JSON.stringify(data)}`);
    const record = await this.model.create(data);
    const recordObject = record.toObject();
    for (const property in recordObject) {
      if (this.defaultProjection[property] === 0) {
        delete recordObject[property];
      }
    }
    return recordObject as T;
  }

  findOne(filters: Record<string, unknown>, projection?: ProjectionFields<T>): Promise<T | null> {
    const projectionFields = { ...projection, ...this.defaultProjection };
    logger.debug(
      `BaseRepository: findOne called with filters: ${JSON.stringify(filters)}, projection: ${JSON.stringify(projectionFields)}`,
    );
    return this.model.findOne(filters, projectionFields);
  }

  update(
    id: string,
    data: Partial<T>,
    projection: ProjectionFields<T>,
    options?: Record<string, boolean>,
  ): Promise<T | null> {
    const filters = { _id: id };
    const defaultOptions = {
      ...options,
      select: { ...this.defaultProjection, ...projection },
      new: true,
    };
    logger.debug(
      `BaseRepository: update called with id: ${id}, data: ${JSON.stringify(data)}, options: ${JSON.stringify(defaultOptions)}`,
    );
    return this.model.findOneAndUpdate(filters, data, defaultOptions);
  }

  delete(id: string, projection: ProjectionFields<T>, options?: Record<string, boolean>): Promise<T | null> {
    const filters = { _id: id };
    const defaultOptions = {
      ...options,
      select: { ...this.defaultProjection, ...projection },
    };
    logger.debug(`BaseRepository: delete called with id: ${id}, options: ${JSON.stringify(defaultOptions)}`);
    return this.model.findOneAndDelete(filters, defaultOptions);
  }
}
