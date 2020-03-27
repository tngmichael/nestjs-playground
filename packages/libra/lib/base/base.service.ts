import { Model, PartialModelObject } from 'objection';

interface List<T> {
  results: T[];
  total: number;
}

interface ListArgs {
  page: number;
  pageSize: number;
  where: WhereInput;
  orderBy: string[];
}

interface WhereInput {
  _search?: string;
  and?: WhereInput[];
  or?: WhereInput[];
  [key: string]: any;
}

export abstract class BaseService<T extends Model> {
  protected constructor(private readonly repository) {}

  public async findOne(id: number): Promise<T> {
    return this.repository.query().findById(id).throwIfNotFound();
  }

  // public async findAll(where, orderBy) {
  //   return this.repository
  //     .query()
  //     .modify('whereEach', where)
  //     .modify('mapOrderBy', orderBy);
  // }

  public async findList({
    page,
    pageSize,
    where,
    orderBy,
  }: ListArgs): Promise<List<T>> {
    return this.repository
      .query()
      .modify('whereEach', where)
      .modify('mapOrderBy', orderBy)
      .page(page, pageSize);
  }

  public async create(props: PartialModelObject<T>): Promise<T> {
    return this.repository.query().insert(props);
  }

  public async update(id: number, props: PartialModelObject<T>): Promise<T> {
    await this.findOne(id); // todo remove this and test below
    return this.repository.query().updateAndFetchById(id, props);
  }

  public async delete(id: number): Promise<number> {
    const data = await this.findOne(id);
    return data.$query().delete();
  }
}
