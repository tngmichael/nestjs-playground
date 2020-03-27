import { GqlTypeReference, TypeOptions } from '../interfaces';

export interface PropertyMetadata {
  schemaName: string;
  name: string;
  typeFn: () => GqlTypeReference;
  target: Function;
  options: TypeOptions;
  description?: string;
  deprecationReason?: string;
}
