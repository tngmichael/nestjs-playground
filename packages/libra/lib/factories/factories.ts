import { CustomTypeFactory } from './custom-types.factory';
import { InterfaceDefinitionFactory } from './interface-definition.factory';
import { NonBasicTypesFactory } from './non-basic-types.factory';
import { ObjectTypeDefinitionFactory } from './object-type-definition.factory';
import { OutputTypeFactory } from './output-type.factory';

export const factories = [
  CustomTypeFactory,
  InterfaceDefinitionFactory,
  NonBasicTypesFactory,
  ObjectTypeDefinitionFactory,
  OutputTypeFactory,
];
