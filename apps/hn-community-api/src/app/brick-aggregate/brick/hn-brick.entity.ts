import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { HnBrickUser } from '../brick-user/hn-brick-user.entity';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { HnUser } from '../../users/hn-user.entity';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnCreateBrickDTO } from './hn-brick.dto';

export enum HnBrickVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export class HnBrickFilter {
  categories: string[];
  topics: string[];
  title: string;
}

@Unique(['name'])
@Entity('brick')
export class HnBrick extends BlEntityWithId {
  @BlNotUpdatable()
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isCertified: boolean;

  @Column({ type: 'enum', enum: HnBrickVisibility, default: HnBrickVisibility.PUBLIC })
  visibility: HnBrickVisibility;

  @Column({ nullable: true })
  pipRepo: string;

  @Column({ nullable: true })
  gitRepo: string;

  @Column({ nullable: true })
  imageLink?: string;

  @Column({ nullable: true })
  credentialUsername?: string;

  @Column({ nullable: true })
  credentialPassword?: string;

  @OneToMany(() => HnBrickUser, (brickUser) => brickUser.brick, { nullable: true, eager: true })
  brickUsers: HnBrickUser[];

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy: HnUser;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  space?: HnSpace;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  initialize(createdBrick: HnCreateBrickDTO): void {
    this.name = createdBrick.name;
    this.description = createdBrick.description;
    this.isCertified = false;
    this.gitRepo = createdBrick.repoGit;
    this.pipRepo = createdBrick.repoPip;
    this.visibility = createdBrick.visibility;
    this.credentialUsername = createdBrick.credentialUsername;
    this.credentialPassword = createdBrick.credentialPassword;
    this.space = createdBrick.visibility == HnBrickVisibility.PRIVATE ? createdBrick.space : null;
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
