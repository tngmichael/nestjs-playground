import { Type } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { addFieldMetadata } from '../decorators';
import {
  ClassMetadata,
  InterfaceMetadata,
  ObjectTypeMetadata,
  PropertyMetadata,
  ScalarMetadata,
} from '../metadata';
import { METADATA_FACTORY_NAME } from '../plugin/plugin-constants';
import { isTargetEqual } from '../utils';

export class TypeMetadataStorageHost {
  private readonly fields = new Array<PropertyMetadata>();
  private readonly interfaces = new Array<InterfaceMetadata>();
  private readonly objectTypes = new Array<ObjectTypeMetadata>();
  private readonly scalars = new Array<ScalarMetadata>();

  addClassFieldMetadata(metadata: PropertyMetadata) {
    const metadataIndex = this.fields.findIndex(
      (item) => item.target === metadata.target && item.name === metadata.name,
    );
    if (metadataIndex > -1) {
      const existingMetadata = this.fields.splice(metadataIndex, 1)[0];
      const options = existingMetadata.options;
      if (isUndefined(options.nullable) && isUndefined(options.defaultValue)) {
        options.nullable = metadata.options.nullable;
      }
      metadata = existingMetadata;
    }
    this.fields.push(metadata);
  }

  addInterfaceMetadata(metadata: InterfaceMetadata) {
    this.interfaces.push(metadata);
  }

  getInterfacesMetadata(): InterfaceMetadata[] {
    return this.interfaces;
  }

  addObjectTypeMetadata(metadata: ObjectTypeMetadata) {
    this.objectTypes.push(metadata);
  }

  getObjectTypesMetadata(): ObjectTypeMetadata[] {
    return this.objectTypes;
  }

  addScalarMetadata(metadata: ScalarMetadata) {
    this.scalars.push(metadata);
  }

  getScalarsMetadata(): ScalarMetadata[] {
    return this.scalars;
  }

  compile() {
    const classMetadata = [...this.interfaces, ...this.objectTypes];
    this.loadClassPluginMetadata(classMetadata);
    this.compileClassMetadata(classMetadata);
  }

  loadClassPluginMetadata(metadata: ClassMetadata[]) {
    metadata
      .filter((item) => item.target)
      .forEach((item) => this.applyPluginMetadata(item.target.prototype));
  }

  applyPluginMetadata(prototype: Function) {
    do {
      if (!prototype.constructor) {
        return;
      }
      if (!prototype.constructor[METADATA_FACTORY_NAME]) {
        continue;
      }
      const metadata = prototype.constructor[METADATA_FACTORY_NAME]();
      const properties = Object.keys(metadata);
      properties.forEach((key) => {
        if (metadata[key].type) {
          const { type, ...options } = metadata[key];
          addFieldMetadata(type, options, prototype, key, undefined);
        } else {
          // todo what case?
          addFieldMetadata(metadata[key], undefined, prototype, key, undefined);
        }
      });
    } while (
      (prototype = Reflect.getPrototypeOf(prototype) as Type<any>) &&
      prototype !== Object.prototype &&
      prototype
    );
  }

  private compileClassMetadata(metadata: ClassMetadata[]) {
    metadata.forEach((item) => {
      const belongsToClass = isTargetEqual.bind(undefined, item);
      if (!item.properties) {
        item.properties = this.getClassFieldsByPredicate(belongsToClass);
      }
    });
  }

  private getClassFieldsByPredicate(
    belongsToClass: (item: PropertyMetadata) => boolean,
  ) {
    const fields = this.fields.filter(belongsToClass);
    // there is more
    return fields;
  }
}

export const TypeMetadataStorage = new TypeMetadataStorageHost();
