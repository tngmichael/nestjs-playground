import { Injectable } from '@nestjs/common';
import {
  GetTypeDefsOptions,
  GqlTypeReference,
  TypeOptions,
} from '../interfaces';
import { TypeMapperSevice } from '../services';
import { TypeDefinitionsStorage } from '../storages';

@Injectable()
export class OutputTypeFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperSevice,
  ) {}

  public create(
    fieldName: string,
    typeRef: GqlTypeReference,
    options: GetTypeDefsOptions,
    typeOptions: TypeOptions = {},
  ) {
    let fieldType = this.typeMapperService.mapToScalarType(typeRef);
    if (!fieldType) {
      fieldType = this.typeDefinitionsStorage.getOutputTypeAndExtract(typeRef);
      if (!fieldType) {
        throw new Error(
          `Cannot determine GraphQL output type for ${fieldName}`!,
        );
      }
    }
    if (fieldType === 'Float') {
      if (options.idNumberToGqlInt) {
        if (
          fieldName.toLowerCase() === 'id' ||
          fieldName.substr(-2) === 'Id' ||
          fieldName.substr(-2) === 'ID'
        ) {
          fieldType = 'Int';
        }
      }
    }
    return this.typeMapperService.mapToFieldType(
      fieldName,
      fieldType,
      typeOptions,
    );
  }
}
