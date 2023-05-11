import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';
import {Column, Entity, Unique} from 'typeorm';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

export enum HnBrickVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public'
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

  @Column({type: 'enum', enum: HnBrickVisibility, default: HnBrickVisibility.PUBLIC})
  visibility: HnBrickVisibility;

  @Column({nullable: true})
  pipRepo: string;

  @Column({nullable: true})
  gitRepo: string;

  @Column({nullable: true})
  imageLink?: string;

  @Column({nullable: true})
  credentialUsername?: string;

  @Column({nullable: true})
  credentialPassword?: string;

  initialize(name: string, description: string, isCertified: boolean,
             visibility: HnBrickVisibility, repoPip?: string, repoGit?: string,
             credentialUsername?: string, credentialPassword?: string): void {
    this.name = name;
    this.description = description;
    this.isCertified = isCertified;
    this.gitRepo = repoGit;
    this.pipRepo = repoPip;
    this.visibility = visibility;
    this.credentialUsername = credentialUsername;
    this.credentialPassword = credentialPassword;
  }


  get repositoryUrl(): string {
    return this.gitRepo || this.pipRepo;
  }

  /**
   * Build the url with the credential if they are set
   */
  get repositoryAccessUrl(): string {
    const url = this.repositoryUrl;

    if (this.credentialUsername && this.credentialPassword) {
      return url.replace('https://', `https://${this.credentialUsername}:${this.credentialPassword}@`);
    }
    return url;
  }

}
