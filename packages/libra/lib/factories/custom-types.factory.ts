import { Injectable } from '@nestjs/common';
import { ObjectTypeDefinition } from './object-type-definition.factory';
import { GetTypeDefsOptions } from '../interfaces';
import { TypeDefinitionsStorage } from '../storages';
import * as stringUtil from '../utils/string.util';

export interface CustomType {
  target: Function;
  typename: string;
  isAbstract: boolean;
  output: Array<Function | string>;
}

@Injectable()
export class CustomTypeFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(options: GetTypeDefsOptions): string[] {
    if (!options.customTypeFactory) {
      return [];
    }
    const objectTypes = this.typeDefinitionsStorage.getAllObjectTypeDefinitions();
    return objectTypes.map((definition) => {
      const customOpt = options.customTypeFactory(
        definition,
        stringUtil,
        objectTypes,
      );
      // todo validate
      // todo type
      // {
      //   typename: `Create${typename}Input`,
      //   exclude: ['id'],
      //   fieldReducer
      // }
      const customOptions = Array.isArray(customOpt) ? customOpt : [customOpt];
      return stringUtil.join(
        customOptions.map((options) =>
          this.generateOutput(definition, options),
        ),
      );
    });
  }

  private generateOutput(
    definition: ObjectTypeDefinition,
    external: any,
  ): string {
    const { extend = false, typename } = external;
    let { host } = external;
    if (extend || typename === 'Query' || typename === 'Mutation') {
      host = `extend ${host}`;
    }
    return stringUtil.join(
      [
        `${host} ${typename} {`,
        this.generateFields(definition.fields, external),
        '}',
      ].filter(Boolean),
    );
  }

  private generateFields(
    fields: any, // todo
    external: any, // todo
  ): string {
    const { customFields = '', exclude = [], nullable } = external;
    if (exclude.length) {
      fields = Object.keys(fields)
        .filter((key) => !exclude.includes(key))
        .reduce((prev, key) => {
          prev[key] = fields[key];
          return prev;
        }, {});
    }
    return stringUtil.addIndent(
      Object.entries(fields).reduce(
        (prev, [name, fieldValue]: any, index, array) => {
          const field = { name, ...fieldValue };
          if (external.host === 'enum') {
            if (typeof external.enumReducer === 'function') {
              return external.enumReducer(prev, field, index, array);
            } else if (external.enumReducer === true) {
              prev.push(`${field.name}`);
            }
          }
          if (typeof external.fieldReducer === 'function') {
            return external.fieldReducer(prev, field, index, array);
          } else if (external.fieldReducer === true) {
            prev.push(`${field.name}: ${field.type.getOutput(nullable)}`);
          }
          return prev;
        },
        [...customFields.split('\n')],
      ),
    );
  }
}
