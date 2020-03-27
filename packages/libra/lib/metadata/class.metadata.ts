import { PropertyMetadata } from './property.metadata';

export interface ClassMetadata {
  target: Function;
  name: string;
  description?: string;
  isAbstract?: boolean;
  properties?: PropertyMetadata[];
}
