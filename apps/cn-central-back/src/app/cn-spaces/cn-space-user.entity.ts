import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpace} from './cn-space.entity';

export enum CnSpaceUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}


@Entity('space_user')
export class CnSpaceUser {

  @PrimaryColumn({type: 'varchar', length: 36})
  userId: string;

  @ManyToOne(() => CnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  user: CnUser;

  @PrimaryColumn({type: 'varchar', length: 36})
  spaceId: string;

  @ManyToOne(() => CnSpace,
    {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  space: CnSpace;

  @Column({
    type: 'enum', enum: CnSpaceUserRole, nullable: false,
    default: CnSpaceUserRole.USER
  })
  role: CnSpaceUserRole;

  @Column({default: true})
  active: boolean;

  isSpaceAdmin(): boolean {
    return this.role === CnSpaceUserRole.ADMIN;
  }
}
