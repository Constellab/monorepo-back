import {PrimaryGeneratedColumn} from 'typeorm';

/**
 * Simple base entity with a uuid
 */
export abstract class BlEntityWithId {

  @PrimaryGeneratedColumn('uuid')
  id: string;

}


export class BlEntityWithIdDTO{
  id: string;
}
