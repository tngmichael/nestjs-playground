import { Inject } from '@nestjs/common';

export const InjectRepository = (entity: Function) =>
  Inject(`${entity.name}Repository`);
