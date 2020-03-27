import { Module } from '@nestjs/common';
import { LibraModel } from 'libra';
import { <%= classify(name) %> } from './<%= name %>.entity';
import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';
import { <%= classify(name) %>Service } from './<%= name %>.service';

@Module({
  imports: [LibraModel.forFeature([<%= classify(name) %>])],
  providers: [<%= classify(name) %>Service, <%= classify(name) %>Resolver],
  exports: [<%= classify(name) %>Service],
})
export class <%= classify(name) %>Module {}
