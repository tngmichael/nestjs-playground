import { isFunction } from '@nestjs/common/utils/shared.utils';
import { BaseTypeOptions, ReturnTypeFunc } from '../interfaces';
import { TypeMetadataStorage } from '../storages';
import { reflectTypeFromMetadata } from '../utils';

export interface FieldOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
}

export function Field(
  options: FieldOptions,
): PropertyDecorator & MethodDecorator;
export function Field(
  returnTypeFunction?: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator & MethodDecorator;
export function Field(
  typeOrOptions?: ReturnTypeFunc | FieldOptions,
  fieldOptions?: FieldOptions,
): PropertyDecorator & MethodDecorator {
  return (
    prototype: object,
    propertyKey: string,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    addFieldMetadata(
      typeOrOptions,
      fieldOptions,
      prototype,
      propertyKey,
      descriptor,
    );
  };
}

export function addFieldMetadata(
  typeOrOptions: ReturnTypeFunc | FieldOptions,
  fieldOptions: FieldOptions,
  prototype: Record<string, any>,
  propertyKey?: string,
  descriptor?: TypedPropertyDescriptor<any>,
) {
  const [typeFunc, options = {}] = isFunction(typeOrOptions)
    ? [typeOrOptions, fieldOptions]
    : [undefined, typeOrOptions as any];

  // const isResolver = !!descriptor;
  const isResolverMethod = !!(descriptor && descriptor.value);

  const { typeFn: getType, options: typeOptions } = reflectTypeFromMetadata({
    metadataKey: isResolverMethod ? 'design:returntype' : 'design:type',
    prototype,
    propertyKey,
    explicitTypeFn: typeFunc as ReturnTypeFunc,
    typeOptions: options,
  });

  TypeMetadataStorage.addClassFieldMetadata({
    name: propertyKey,
    schemaName: options.name || propertyKey,
    typeFn: getType,
    options: typeOptions,
    target: prototype.constructor,
    description: options.description,
    deprecationReason: options.deprecationReason,
  });
}
