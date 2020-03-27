import { Injectable } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { GraphQLScalarType } from 'graphql';
import {
  DefaultNullableConflictError,
  InvalidNullableOptionError,
} from '../errors';
import { GqlTypeReference, TypeOptions } from '../interfaces';
import { ScalarMetadata } from '../metadata';
import { Float, ID, Int } from '../scalars';
import { TypeMetadataStorage } from '../storages';

@Injectable()
export class TypeMapperSevice {
  private readonly typeScalarMapping = new Map<
    Function | GraphQLScalarType,
    string
  >([
    [String, 'String'],
    [Number, 'Float'],
    [Float, 'Float'],
    [Boolean, 'Boolean'],
    [ID, 'ID'],
    [Int, 'Int'],
  ]);
  private scalarMetadataLinks?: Array<ScalarMetadata>;

  public mapToScalarType(typeRef: GqlTypeReference): string | undefined {
    if (!this.scalarMetadataLinks) {
      this.scalarMetadataLinks = TypeMetadataStorage.getScalarsMetadata();
    }
    let scalarType = this.typeScalarMapping.get(typeRef as Function);
    if (!scalarType) {
      const scalarExists = this.scalarMetadataLinks.find(
        (metadata) => metadata.name === typeRef.name,
      );
      if (scalarExists) {
        scalarType = scalarExists.name;
      }
    }
    return scalarType;
  }

  public mapToFieldType(
    hostType: string,
    typeRef: string,
    options: TypeOptions,
  ) {
    this.validateTypeOptions(hostType, options);
    let graphqlType: string | string[] = typeRef;

    if (options.isArray) {
      graphqlType = this.mapToList(
        graphqlType,
        options.arrayDepth!,
        this.hasArrayOptions(options),
      );
    }

    const isNotNullable =
      isUndefined(options.defaultValue) &&
      (!options.nullable || options.nullable === 'items');
    const output = isNotNullable ? `${graphqlType}!` : graphqlType;

    return {
      name: typeRef,
      nullable: !isNotNullable,
      output,
      getOutput: (nullable) => {
        if (typeof nullable === 'boolean') {
          return !nullable ? `${graphqlType}!` : graphqlType;
        }
        return output;
      },
    };
  }

  private validateTypeOptions(hostType: string, options: TypeOptions) {
    if (!options.isArray && this.hasArrayOptions(options)) {
      throw new InvalidNullableOptionError(hostType, options.nullable);
    }

    const isNotNullable = options.nullable === 'items';
    if (!isUndefined(options.defaultValue) && isNotNullable) {
      throw new DefaultNullableConflictError(
        hostType,
        options.defaultValue,
        options.nullable,
      );
    }
    return true;
  }

  private mapToList(
    targetType: string | any[],
    depth: number,
    nullable: boolean,
  ): string {
    if (depth === 0) {
      return (targetType as string[]).join('');
    }
    if (Array.isArray(targetType)) {
      targetType.join('');
    }
    const targetTypeNonNull = nullable
      ? ['[', targetType, , ']']
      : ['[', targetType, '!', ']'];

    return this.mapToList(targetTypeNonNull, depth - 1, nullable);
  }

  private hasArrayOptions(options: TypeOptions) {
    return options.nullable === 'items' || options.nullable === 'itemsAndList';
  }
}
