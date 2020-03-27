import { Resolver } from '@nestjs/graphql';
import { BaseResolver } from 'libra/base';
import { <%= classify(name) %> } from './<%= name %>.entity';
import { <%= classify(name) %>Service } from './<%= name %>.service';

@Resolver()
export class <%= classify(name) %>Resolver extends BaseResolver(<%= classify(name) %>) {
  constructor(private readonly <%= camelize(name) %>Service: <%= classify(name) %>Service) {
    super(<%= camelize(name) %>Service);
  }
}
