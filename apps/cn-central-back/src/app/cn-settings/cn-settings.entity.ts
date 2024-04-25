import {Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';

export class CnServerDecisionTreeOptionDTO {
  title: string;
  description: string;
  // if not leaf
  children?: CnServerDecisionTreeOptionDTO[];
  // if leaf
  suggestedServerNames?: string[];
}

export class CnServerDecisionTreeDTO {
  tree: CnServerDecisionTreeOptionDTO[];
}


@Entity('settings')
export class CnSettings extends CnBaseEntity {

  // store a json object use to build the decision tree to select a server when create a lab
  @Column({type: 'simple-json', nullable: false})
  serverDecisionTree: CnServerDecisionTreeDTO;
}
