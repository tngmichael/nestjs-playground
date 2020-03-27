import { InterfaceType, ObjectType } from 'libra';

@InterfaceType()
class Node {
  id: number;
}

@ObjectType({ implements: Node })
export class User extends Node {
  // id: number;
  firstName: string;
  lastName?: string;
  isActive?: boolean;
  created?: Date;
}
