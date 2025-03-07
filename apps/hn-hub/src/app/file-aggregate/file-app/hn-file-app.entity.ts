import { Entity, ManyToOne } from 'typeorm';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';
import { HnCommunityAppEntity } from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Entity('file_app')
export class HnFileApp extends HnAbstractFileEntity<HnCommunityAppEntity> {
  @ManyToOne(() => HnCommunityAppEntity, (app) => app.appFiles, { nullable: false, onDelete: 'CASCADE' })
  entity: HnCommunityAppEntity;
}
