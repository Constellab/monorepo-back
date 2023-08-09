import {Entity, PrimaryColumn} from 'typeorm';

// TODO TEMP ENTITY TO MIGRATE
@Entity('project_group')
export class CnProjectGroup {

  @PrimaryColumn({type: 'varchar', length: 36})
  groupId: string;

  @PrimaryColumn({type: 'varchar', length: 36})
  projectId: string;
}
