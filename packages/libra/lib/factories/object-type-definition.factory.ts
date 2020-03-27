import { Injectable } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { OutputTypeFactory } from './output-type.factory';
import { GetTypeDefsOptions } from '../interfaces';
import { ObjectTypeMetadata, PropertyMetadata } from '../metadata';
import { TypeDefinitionsStorage } from '../storages';
import { addIndent } from '../utils';

export interface ObjectTypeDefinition {
  target: Function;
  typename: string;
  isAbstract: boolean;
  interfaces: Function[];
  fields: any; // todo
  output: Array<Function | string>;
}

@Injectable()
export class ObjectTypeDefinitionFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly outputTypeFactory: OutputTypeFactory,
  ) {}

  public create(
    metadata: ObjectTypeMetadata,
    options: GetTypeDefsOptions,
  ): ObjectTypeDefinition {
    const definition = {
      target: metadata.target,
      typename: metadata.name,
      isAbstract: metadata.isAbstract || false,
      interfaces: metadata.interfaces || [],
      fields: [],
      output: [],
    };
    const getFields = this.generateFields(metadata, definition, options);
    definition.output = this.generateOutput(metadata, getFields);
    return definition;
  }

  private generateOutput(
    metadata: ObjectTypeMetadata,
    getFields: any,
  ): Array<Function | string> {
    const getHost = () => {
      const implementedTypes = this.generateInterfaces(metadata);
      return `type ${metadata.name}${
        implementedTypes.length
          ? ` implements ${implementedTypes.join(' & ')}`
          : ''
      } {`;
    };
    return [getHost, getFields, '}'];
  }

  private generateInterfaces(metadata: ObjectTypeMetadata) {
    return (metadata.interfaces || []).map(
      (item) => this.typeDefinitionsStorage.getInterfaceByTarget(item).typename,
    );
  }

  private generateFields(
    metadata: ObjectTypeMetadata,
    definition: ObjectTypeDefinition,
    options: GetTypeDefsOptions,
  ) {
    const prototype = Object.getPrototypeOf(metadata.target);
    const getParentFields = () => {
      const parentTypeDefinition = this.typeDefinitionsStorage.getObjectTypeByTarget(
        prototype,
      );
      return parentTypeDefinition ? parentTypeDefinition.fields : undefined;
    };

    return () => {
      let fields = {};
      metadata.properties.forEach((field: PropertyMetadata) => {
        fields[field.schemaName] = {
          // todo args: `(where: WhereInput)`
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
      if (metadata.interfaces) {
        let interfaceFields = {};
        metadata.interfaces.forEach((item) => {
          const interfaceDef = this.typeDefinitionsStorage.getInterfaceByTarget(
            item,
          );
          interfaceFields = {
            ...interfaceFields,
            ...interfaceDef.fields,
          };
        });
        fields = {
          ...interfaceFields,
          ...fields,
        };
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
