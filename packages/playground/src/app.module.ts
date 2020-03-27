import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { LibraModule, GqlModuleConfigService } from 'libra';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

const extend = `scalar Date
type Query {
  _version: String
}
type Mutation {
  _version: String
}
input StringFilter {
  eq: String
  like: String
  isNull: String
}
input BooleanFilter {
  eq: Boolean
  like: Boolean
  isNull: Boolean
}
input DateFilter {
  eq: Date
  like: Date
  isNull: Date
}`;

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [LibraModule],
      useFactory: (configService: GqlModuleConfigService) => {
        return {
          typeDefs: configService.getTypeDefs({
            extend,
            idNumberToGqlInt: true,
            customTypeFactory(objectType, { decapitalize, join, plural }) {
              const { typename: name } = objectType;
              const pluralized = plural(name);
              return [
                {
                  host: 'input',
                  typename: `Create${name}Input`,
                  exclude: ['id'],
                  fieldReducer: true,
                },
                {
                  host: 'input',
                  typename: `Update${name}Input`,
                  exclude: ['id'],
                  nullable: true,
                  fieldReducer: true,
                },
                {
                  host: 'input',
                  typename: `${name}WhereInput`,
                  exclude: ['id'],
                  fieldReducer(prev, field, index) {
                    if (index === 0) {
                      prev.push(`_search: String`);
                      prev.push(`and: [${name}WhereInput!]`);
                      prev.push(`or: [${name}WhereInput!]`);
                    }
                    prev.push(`${field.name}: ${field.type.name}Filter`);
                    return prev;
                  },
                },
                {
                  host: 'enum',
                  typename: `${name}OrderByInput`,
                  enumReducer(prev, field) {
                    prev.push(`${field.name}\n  ${field.name}Desc`);
                    return prev;
                  },
                },
                {
                  host: 'type',
                  typename: `${pluralized}List`,
                  customFields: join([`results: [${name}!]!`, `total: Int!`]),
                },
                {
                  host: 'type',
                  typename: `Mutation`,
                  customFields: join([
                    `create${name}(input: Create${name}Input!): ${name}!`,
                    `update${name}(_id: ID!, input: Update${name}Input!): ${name}!`,
                    `delete${name}(_id: ID!): Int!`,
                  ]),
                },
                {
                  host: 'type',
                  typename: `Query`,
                  customFields: join([
                    `${decapitalize(name)}(_id: ID!): ${name}!`,
                    `${decapitalize(pluralized)}List(`,
                    `  page: Int = 0`,
                    `  pageSize: Int = 10`,
                    `  where: ${name}WhereInput`,
                    `  orderBy: [${name}OrderByInput!] = [idDesc]`,
                    `): ${pluralized}List!`,
                  ]),
                },
              ];
            },
          }),
          // typePaths: ['./**/*.graphql'],
          definitions: {
            path: './src/graphql.schema.ts',
          },
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
        };
      },
      inject: [GqlModuleConfigService],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
