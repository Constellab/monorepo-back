import {PrimaryGeneratedColumn} from 'typeorm';

export abstract class EntityWithId {

  @PrimaryGeneratedColumn('uuid')
  id: string;

}
