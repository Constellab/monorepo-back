import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, Entity} from 'typeorm';
import {HnIconCreateDto} from './hn-icon.dto';

export enum HnIconType {
  COMMUNITY_ICON = 'COMMUNITY_ICON',
  COMMUNITY_IMAGE = 'COMMUNITY_IMAGE'
}

@Entity('icon')
export class HnIcon extends BlEntityWithId{
  @Column({length: 30, name: 'technical_name', unique: true})
  technicalName: string;

  @Column()
  name: string;

  @Column('simple-array', {name: 'sub_names'})
  subNames: string[];

  @Column({type: 'enum', enum: HnIconType, default: HnIconType.COMMUNITY_ICON})
  type: HnIconType;

  @Column({name: 'file_name'})
  fileName: string;

  init(_icon: HnIconCreateDto): void{
    this.technicalName = _icon.technicalName;
    this.name = _icon.name;
    this.subNames = _icon.subNames.split(',');
    this.type = _icon.type;
  }
}
