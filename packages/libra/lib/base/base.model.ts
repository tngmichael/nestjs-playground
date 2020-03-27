import { Model } from 'objection';
import { ID, Int } from '@nestjs/graphql';
import { Field, InterfaceType } from '../decorators';

const encode = (id: number | string, type: string): string =>
  Buffer.from(`${id}:${type}`).toString('base64');

const mapOrderBy = (
  arr: string[],
): Array<{ column: string; order?: string }> => {
  return arr.map((str) => {
    const match = str.match(/(.+)Desc$/);
    return {
      column: match ? match[1] : str,
      order: match ? 'desc' : 'asc',
    };
  });
};

const operatorMap = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'LIKE',
  in: 'IN',
  notIn: 'NOT IN',
};

const whereEach = (query, where, operator = 'and') => {
  if (Array.isArray(where) && where.length) {
    query.where(function () {
      for (const each of where) {
        whereEach(this, each, operator);
      }
    });
  } else if (typeof where === 'object') {
    for (const key in where) {
      if (key === 'or') {
        whereEach(query, where[key], 'or');
      } else if (key === 'and') {
        whereEach(query, where[key], 'and');
      } else {
        for (const key2 in where[key]) {
          const value = where[key][key2];
          if (key2 === 'isNull') {
            query[`${operator}Where`](function () {
              this[`where${value ? 'Null' : 'NotNull'}`](key);
            });
          } else {
            query[`${operator}Where`](
              key,
              operatorMap[key2],
              key2 === 'like' ? `%${value}%` : value,
            );
          }
        }
      }
    }
  }
};

@InterfaceType('Node')
export abstract class NodeInterface {
  @Field(() => ID)
  readonly _id: string;
  readonly id: number;
}

export abstract class BaseModel extends Model {
  readonly id: number;

  static modifiers = {
    whereEach(query, where) {
      query.where((qb) => {
        whereEach(qb, where);
      });
    },

    mapOrderBy(query, orderBy) {
      query.orderBy(mapOrderBy(orderBy));
    },
  };

  // if this omitted, getter _id still working
  static virtualAttributes = ['_id'];

  get _id(): string {
    return encode(this.id, (this as any).constructor.tableName);
  }

  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    for (const [key, value] of Object.entries(json)) {
      if (typeof json[key] === 'string') {
        json[key] = String(value).trim();
      }
    }

    return json;
  }
}
