import { Injectable } from '@nestjs/common';
import { InterfaceTypeDefinition, ObjectTypeDefinition } from '../factories';

export type GqlOutputTypeKey = Function | object;
export type GqlOutputType = InterfaceTypeDefinition | ObjectTypeDefinition;

@Injectable()
export class TypeDefinitionsStorage {
  private readonly interfaceTypeDefinitions = new Map<
    Function,
    InterfaceTypeDefinition
  >();
  private readonly objectTypeDefinitions = new Map<
    Function,
    ObjectTypeDefinition
  >();
  private outputTypeDefinitionsLinks?: Map<GqlOutputTypeKey, GqlOutputType>;

  addInterfaces(interfaceDefs: InterfaceTypeDefinition[]) {
    interfaceDefs.forEach((item) =>
      this.interfaceTypeDefinitions.set(item.target, item),
    );
  }

  getInterfaceByTarget(type: Function): InterfaceTypeDefinition {
    return this.interfaceTypeDefinitions.get(type);
  }

  getAllInterfaceDefinitions(): InterfaceTypeDefinition[] {
    return Array.from(this.interfaceTypeDefinitions.values());
  }

  addObjectTypes(objectDefs: ObjectTypeDefinition[]) {
    objectDefs.forEach((item) =>
      this.objectTypeDefinitions.set(item.target, item),
    );
  }

  getObjectTypeByTarget(type: Function): ObjectTypeDefinition {
    return this.objectTypeDefinitions.get(type);
  }

  getAllObjectTypeDefinitions(): ObjectTypeDefinition[] {
    return Array.from(this.objectTypeDefinitions.values());
  }

  getOutputTypeAndExtract(key: GqlOutputTypeKey): string | undefined {
    if (!this.outputTypeDefinitionsLinks) {
      this.outputTypeDefinitionsLinks = new Map<
        GqlOutputTypeKey,
        GqlOutputType
      >([
        ...this.objectTypeDefinitions.entries(),
        ...this.interfaceTypeDefinitions.entries(),
      ]);
    }
    const definition = this.outputTypeDefinitionsLinks.get(key);
    if (definition) {
      return definition.typename;
    }
    return;
  }
}
