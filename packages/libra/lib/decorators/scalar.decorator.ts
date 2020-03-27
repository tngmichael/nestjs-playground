import { Scalar as NestScalar } from '@nestjs/graphql';
import { TypeMetadataStorage } from '../storages';

export function Scalar(name: string): ClassDecorator {
  const returnFn = NestScalar(name);
  return (target) => {
    returnFn(target);
    TypeMetadataStorage.addScalarMetadata({
      target,
      name,
      typeFn: () => target,
    });
  };
}
