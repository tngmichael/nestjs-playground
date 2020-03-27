import { Injectable } from '@nestjs/common';
import {
  InterfaceDefinitionFactory,
  ObjectTypeDefinitionFactory,
} from './factories';
import { GetTypeDefsOptions } from './interfaces';
import { TypeDefinitionsStorage, TypeMetadataStorage } from './storages';

@Injectable()
export class TypeDefinitionsGenerator {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly interfaceDefinitionFactory: InterfaceDefinitionFactory,
    private readonly objectTypeDefinitionFactory: ObjectTypeDefinitionFactory,
  ) {}

  generate(options: GetTypeDefsOptions) {
    this.generateInterfaceDefs(options);
    this.generateObjectTypeDefs(options);
  }

  private generateInterfaceDefs(options: GetTypeDefsOptions) {
    const metadata = TypeMetadataStorage.getInterfacesMetadata();
    const interfaceDefs = metadata.map((metadata) =>
      this.interfaceDefinitionFactory.create(metadata, options),
    );
    this.typeDefinitionsStorage.addInterfaces(interfaceDefs);
  }

  private generateObjectTypeDefs(options: GetTypeDefsOptions) {
    const metadata = TypeMetadataStorage.getObjectTypesMetadata();
    const objectTypeDefs = metadata.map((metadata) =>
      this.objectTypeDefinitionFactory.create(metadata, options),
    );
    this.typeDefinitionsStorage.addObjectTypes(objectTypeDefs);
  }
}
