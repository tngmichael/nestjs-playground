import { isString } from '@nestjs/common/utils/shared.utils';
import { TypeMetadataStorage } from '../storages';

export interface InterfaceTypeOptions {
  description?: string;
  isAbstract?: boolean;
}

export function InterfaceType(options?: InterfaceTypeOptions): ClassDecorator;
export function InterfaceType(
  name: string,
  options?: InterfaceTypeOptions,
): ClassDecorator;
export function InterfaceType(
  nameOrOptions?: string | InterfaceTypeOptions,
  interfaceOptions?: InterfaceTypeOptions,
): ClassDecorator {
  const [name, options = {}] = isString(nameOrOptions)
    ? [nameOrOptions, interfaceOptions]
    : [undefined, nameOrOptions];

  return (target) => {
    TypeMetadataStorage.addInterfaceMetadata({
      name: name || target.name,
      target,
      ...options,
    });
  };
}
