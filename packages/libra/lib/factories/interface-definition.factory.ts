import { Injectable } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { OutputTypeFactory } from './output-type.factory';
import { GetTypeDefsOptions } from '../interfaces';
import { InterfaceMetadata, PropertyMetadata } from '../metadata';
import { TypeDefinitionsStorage } from '../storages';
import { addIndent } from '../utils';

export interface InterfaceTypeDefinition {
  target: Function;
  typename: string;
  isAbstract: boolean;
  fields: any; // todo
  output: Array<Function | string>;
}

@Injectable()
export class InterfaceDefinitionFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly outputTypeFactory: OutputTypeFactory,
  ) {}

  public create(
    metadata: InterfaceMetadata,
    options: GetTypeDefsOptions,
  ): InterfaceTypeDefinition {
    const definition = {
      target: metadata.target,
      typename: metadata.name,
      isAbstract: metadata.isAbstract || false,
      fields: [],
      output: [],
    };
    const getFields = this.generateFields(metadata, definition, options);
    definition.output = this.generateOutput(metadata, getFields);
    return definition;
  }

  private generateOutput(
    metadata: InterfaceMetadata,
    getFields: any,
  ): Array<Function | string> {
    return [`interface ${metadata.name} {`, getFields, '}'];
  }

  private generateFields(
    metadata: InterfaceMetadata,
    definition: InterfaceTypeDefinition,
    options: GetTypeDefsOptions,
  ) {
    const prototype = Object.getPrototypeOf(metadata.target);
    const getParentFields = () => {
      const parentTypeDefinition = this.typeDefinitionsStorage.getInterfaceByTarget(
        prototype,
      );
      return parentTypeDefinition ? parentTypeDefinition.fields : undefined;
    };

    return () => {
      let fields = {};
      metadata.properties.forEach((field: PropertyMetadata) => {
        fields[field.schemaName] = {
          type: this.outputTypeFactory.create(
            field.name,
            field.typeFn(),
            options,
            field.options,
          ),
        };
      });
      if (!isUndefined(prototype)) {
        const parentFields = getParentFields();
        if (parentFields) {
          fields = {
            ...parentFields,
            ...fields,
          };
        }
      }
      definition.fields = fields;
      return addIndent(
        Object.entries(fields).map(
          ([name, { type }]: any) => `${name}: ${type.output}`,
        ),
      );
    };
  }
}
