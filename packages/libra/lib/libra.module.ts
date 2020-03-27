import { Module } from '@nestjs/common';
import { factories } from './factories/factories';
import { GqlModuleConfigService } from './gql-module-config.service';
import { TypeMapperSevice } from './services';
import { TypeDefinitionsStorage } from './storages';
import { TypeDefinitionsGenerator } from './type-definitions.generator';

@Module({
  providers: [
    ...factories,
    GqlModuleConfigService,
    TypeDefinitionsGenerator,
    TypeDefinitionsStorage,
    TypeMapperSevice,
  ],
  exports: [GqlModuleConfigService],
})
export class LibraModule {}
