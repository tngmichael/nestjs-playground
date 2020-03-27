import { GqlTypeReference } from '../interfaces';

export interface ScalarMetadata {
  target: Function;
  name: string;
  typeFn: () => GqlTypeReference;
}
