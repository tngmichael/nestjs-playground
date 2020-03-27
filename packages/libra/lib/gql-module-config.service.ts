import { Injectable } from '@nestjs/common';
import { CustomTypeFactory, NonBasicTypesFactory } from './factories';
import { GetTypeDefsOptions } from './interfaces';
import { TypeMetadataStorage } from './storages';
import { TypeDefinitionsGenerator } from './type-definitions.generator';

@Injectable()
export class GqlModuleConfigService {
  constructor(
    private readonly customTypesFactory: CustomTypeFactory,
    private readonly nonBasicTypesFactory: NonBasicTypesFactory,
    private readonly typeDefinitionsGenerator: TypeDefinitionsGenerator,
  ) {}

  getTypeDefs(options: GetTypeDefsOptions = {}): string[] {
    options = {
      idNumberToGqlInt: false,
      ...options,
    };
    TypeMetadataStorage.compile();
    this.typeDefinitionsGenerator.generate(options);
    const typeDefs = [
      options.extend,
      ...this.nonBasicTypesFactory.create(),
      ...this.customTypesFactory.create(options),
    ];
    console.log(typeDefs.join('\n'));
    return typeDefs;
  }
}
