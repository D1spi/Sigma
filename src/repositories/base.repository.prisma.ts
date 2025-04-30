// A generic repository class providing common database operations.
// Can be extended by specific repositories like user.repository.ts.

export interface IRepositoryDelegate<T> {
  findFirst: (args: unknown) => Promise<T | null>;
  findMany: (args: unknown) => Promise<T[]>;
  create: (args: unknown) => Promise<T>;
  update: (args: unknown) => Promise<T>;
  delete: (args: unknown) => Promise<T>;
}

export class BaseRepository<T, CreateInput, Delegate extends IRepositoryDelegate<T>> {
  private readonly delegate;

  constructor(delegate: Delegate) {
    this.delegate = delegate;
  }

  getById(id: number, projection: Record<string, boolean>): Promise<T | null> {
    return this.delegate.findFirst({
      where: { id: id },
      select: projection,
    });
  }

  find(
    filters: Record<string, unknown>,
    projection: Record<string, boolean>,
    pagination?: Record<string, number>,
  ): Promise<T[]> {
    return this.delegate.findMany({
      where: filters,
      select: projection,
      skip: pagination?.skip,
      take: pagination?.limit,
    });
  }

  create(data: CreateInput, projection: Record<string, boolean>): Promise<T> {
    return this.delegate.create({
      data,
      select: projection,
    });
  }

  findOne(filters: Record<string, unknown>, projection: Record<string, boolean>): Promise<T | null> {
    return this.delegate.findFirst({
      where: filters,
      select: projection,
    });
  }

  update(id: number, data: T, projection: Record<string, boolean>): Promise<T> {
    return this.delegate.update({
      where: { id },
      data,
      select: projection,
    });
  }

  delete(id: number, projection: Record<string, boolean>): Promise<T> {
    return this.delegate.delete({
      where: { id },
      select: projection,
    });
  }
}
