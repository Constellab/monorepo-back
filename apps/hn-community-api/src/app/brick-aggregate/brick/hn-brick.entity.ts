import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, Unique } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUser } from '../../users/hn-user.entity';
import { HnCreateBrickDTO } from './hn-brick.dto';

export enum HnBrickVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export class HnBrickFilter {
  categories!: string[];
  topics!: string[];
  title!: string;
}

@Unique(['name'])
@Entity('brick')
export class HnBrickEntity extends BlEntityWithId {
  @BlNotUpdatable()
  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  isCertified!: boolean;

  @Column({ type: 'enum', enum: HnBrickVisibility, default: HnBrickVisibility.PUBLIC })
  visibility!: HnBrickVisibility;

  @Column({ nullable: true })
  pipRepo!: string | null;

  @Column({ nullable: true })
  gitRepo!: string | null;

  @Column({ nullable: true })
  imageLink?: string | null;

  @Column({ nullable: true })
  credentialUsername?: string | null;

  @Column({ nullable: true })
  credentialPassword?: string | null;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy?: HnUser;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  space?: HnSpace | null;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser() ?? undefined;
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser() ?? undefined;
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
    return this.gitRepo || this.pipRepo || '';
  }

  /**
   * Build the url with the credential if they are set
   */
  get repositoryAccessUrl(): string {
    const url = this.repositoryUrl;

    if (this.credentialUsername && this.credentialPassword) {
      const encodedUser = encodeURIComponent(this.credentialUsername);
      const encodedPassword = encodeURIComponent(this.credentialPassword);
      return url.replace('https://', `https://${encodedUser}:${encodedPassword}@`);
    }
    return url;
  }
}

export type HnBrick = HnBrickEntity;
