import { Type } from '@nestjs/common';
import { GraphQLScalarType } from 'graphql';

export type GqlTypeReference = Type<any> | GraphQLScalarType | Function;
export type ReturnTypeFuncValue = GqlTypeReference | [GqlTypeReference];
export type ReturnTypeFunc = (returns?: void) => ReturnTypeFuncValue;
