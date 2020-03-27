import { Int } from '@nestjs/graphql';
import { Field, ObjectType } from 'libra';
import { BaseModel, NodeInterface } from 'libra/base';

@ObjectType({ implements: NodeInterface })
export class <%= classify(name) %> extends BaseModel {
  static tableName = '<%= underscore(name) %>';

  name: string;
}
