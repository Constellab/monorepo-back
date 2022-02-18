import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBrickVersion} from '../cn-bricks/cn-brick-version.entity';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';
import {Exclude, Expose} from 'class-transformer';

/**
 * Entity to store the different version of the lab front.
 * The version is linked to the gws_core brick version. This is managed by admins
 */
@Unique(['gwsCoreBrickVersion'])
@Unique(['major', 'minor', 'patch'])
@Entity('lab_front_version')
export class CnLabFrontVersion extends CnBaseEntity {

  @Exclude()
  @Column({default: 1})
  major: number;

  @Exclude()
  @Column({default: 0})
  minor: number;

  @Exclude()
  @Column({default: 0})
  patch: number;

  @ManyToOne(() => CnBrickVersion, {nullable: false, eager: true})
  gwsCoreBrickVersion: CnBrickVersion;

  @CmVersionTransform()
  @Expose()
  public get version(): CmVersion {
    return new CmVersion(this.major, this.minor, this.patch);
  }

  public set version(version: CmVersion) {
    this.major = version.major;
    this.minor = version.minor;
    this.patch = version.patch;
  }

}

