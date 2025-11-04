import { Column, Entity } from 'typeorm';

import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';

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

export class CnConstellabSuiteAppDTO {
  name: string;
  emoji: string;
  background: string;
  shortDescription: string;
  communityAppLink?: string;
}

export class CnConstellabSuiteDTO {
  apps: CnConstellabSuiteAppDTO[];
}

export interface CnRequestAppDTO {
  appName: string;
}

@Entity('settings')
export class CnSettings extends CnBaseEntity {
  // store a json object use to build the decision tree to select a server when create a lab
  @Column({ type: 'simple-json', nullable: false })
  serverDecisionTree: CnServerDecisionTreeDTO;

  // store a list of Constellab Suite applications
  @Column({ type: 'simple-json', nullable: true })
  constellabSuite: CnConstellabSuiteDTO;

  public static createDefault(): CnSettings {
    const settings = new CnSettings();
    settings.serverDecisionTree = { tree: [] };
    settings.constellabSuite = { apps: [] };
    return settings;
  }
}
