import { Injectable } from '@nestjs/common';
import { TypeDefinitionsStorage } from '../storages';
import { join } from '../utils';

@Injectable()
export class NonBasicTypesFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(): string[] {
    const interfaceTypeDefs = this.typeDefinitionsStorage.getAllInterfaceDefinitions();
    const objectTypeDefs = this.typeDefinitionsStorage.getAllObjectTypeDefinitions();
    const classTypeDefs = [...interfaceTypeDefs, ...objectTypeDefs];
    return classTypeDefs.reduce((prev, item) => {
      item.output = this.transformOutput(item.output);
      if (!item.isAbstract) {
        prev.push(join(item.output as string[]));
      }
      return prev;
    }, []);
  }

  private transformOutput(output: Array<Function | string>) {
    return output.map((item) => (typeof item === 'function' ? item() : item));
  }
}
