import { Injectable } from '@nestjs/common';
import { InjectRepository } from 'libra';
import { BaseService } from 'libra/base';
import { ModelClass } from 'objection';
import { <%= classify(name) %> } from './<%= name %>.entity';

@Injectable()
export class <%= classify(name) %>Service extends BaseService<<%= classify(name) %>> {
  constructor(
    @InjectRepository(<%= classify(name) %>)
    private readonly <%= camelize(name) %>Repository: ModelClass<<%= classify(name) %>>,
  ) {
    super(<%= camelize(name) %>Repository);
  }
}
