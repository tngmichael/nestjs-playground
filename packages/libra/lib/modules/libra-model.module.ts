import { DynamicModule, Module, ValueProvider } from '@nestjs/common';

@Module({})
export class LibraModel {
  static forFeature(entities: Function[] = []): DynamicModule {
    const providers = this.createProviders(entities);
    return {
      module: LibraModel,
      providers: providers,
      exports: providers,
    };
  }

  static createProviders(entities?: Function[]): ValueProvider[] {
    return (entities || []).map((entity) => ({
      provide: `${entity.name}Repository`,
      useValue: entity,
    }));
  }
}
