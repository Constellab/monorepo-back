import { Entity, ManyToOne } from 'typeorm';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';
import {
  HnCommunityApp,
  HnCommunityAppEntity,
} from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Entity('file_app')
export class HnFileApp extends HnAbstractFileEntity<HnCommunityApp> {
  @ManyToOne(() => HnCommunityAppEntity, (app) => app.appFiles, { nullable: false, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
