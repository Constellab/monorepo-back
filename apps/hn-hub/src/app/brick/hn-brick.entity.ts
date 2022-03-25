import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {Column, Entity, Unique} from 'typeorm';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion} from '@monorepo/common-model';
import {HnRepoType} from '../brick-version/hn-brick-version.entity';

export class HnCreateBrickDTO {
  name: string;
  description: string;
  repoType: HnRepoType;
  repoGit: string;
  repoPip: string;
  version: CmVersion;
}

@Unique(['name'])
@Entity('Brick')
export class HnBrick extends HnBaseEntity {
  @BlNotUpdatable()
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isCertified: boolean;

  @Column({nullable: true})
  pipRepo: string;

  @Column({nullable: true})
  gitRepo: string;

  initialize(name: string, description: string, isCertified: boolean, repoPip?: string, repoGit?:string): void {
    this.name = name;
    this.description = description;
    this.isCertified = isCertified;
    this.gitRepo = repoGit;
    this.pipRepo = repoPip;
  }

}
