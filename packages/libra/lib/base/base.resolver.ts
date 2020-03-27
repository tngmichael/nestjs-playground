import { UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Model, ModelClass, PartialModelObject } from 'objection';
import { plural } from 'pluralize';
import { DecodeIdPipe } from '../pipes/decode-id.pipe';

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const decapitalize = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

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

export function BaseResolver<T extends Model>(
  classType: ModelClass<T>,
  maybeName?: string,
): any {
  const name = maybeName || classType.name;
  const capitalized = capitalize(name);
  const decapitalized = decapitalize(name);

  @Resolver(classType)
  @UsePipes(new DecodeIdPipe(classType))
  abstract class BaseResolver {
    protected constructor(private readonly crudService) {} // todo interface

    @Query(decapitalized)
    async getOne(@Args('_id') id: number): Promise<T> {
      return this.crudService.findOne(id);
    }

    @Query(`${plural(decapitalized)}List`)
    async getList(@Args() args: ListArgs): Promise<List<T>> {
      return this.crudService.findList(args);
    }

    @Mutation(`create${capitalized}`)
    async create(@Args('input') input: PartialModelObject<T>): Promise<T> {
      return this.crudService.create(input);
    }

    @Mutation(`update${capitalized}`)
    async update(
      @Args('_id') id: number,
      @Args('input') input: PartialModelObject<T>,
    ): Promise<T> {
      return this.crudService.update(id, input);
    }

    @Mutation(`delete${capitalized}`)
    async delete(@Args('_id') id: number): Promise<number> {
      return this.crudService.delete(id);
    }
  }

  return BaseResolver;
}
