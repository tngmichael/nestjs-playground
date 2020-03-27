import { isString } from '@nestjs/common/utils/shared.utils';
import { TypeMetadataStorage } from '../storages';

export interface ObjectTypeOptions {
  description?: string;
  isAbstract?: boolean;
  implements?: Function | Function[];
}

export function ObjectType(): ClassDecorator;
export function ObjectType(options: ObjectTypeOptions): ClassDecorator;
export function ObjectType(
  name: string,
  options?: ObjectTypeOptions,
): ClassDecorator;
export function ObjectType(
  nameOrOptions?: string | ObjectTypeOptions,
  objectTypeOptions?: ObjectTypeOptions,
): ClassDecorator {
  const [name, options = {}] = isString(nameOrOptions)
    ? [nameOrOptions, objectTypeOptions]
    : [undefined, nameOrOptions];

  const interfaces = options.implements
    ? [].concat(options.implements)
    : undefined;
  return (target) => {
    TypeMetadataStorage.addObjectTypeMetadata({
      name: name || target.name,
      target,
      description: options.description,
      interfaces,
      isAbstract: options.isAbstract,
    });
  };
}
