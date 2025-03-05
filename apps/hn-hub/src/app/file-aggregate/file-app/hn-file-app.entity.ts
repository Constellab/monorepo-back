import { Entity, ManyToOne } from 'typeorm';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';
import { HnCommunityApp } from '../../community-app-aggregate/hn-community-app/hn-community-app.entity';

@Entity('file_app')
export class HnFileApp extends HnAbstractFileEntity<HnCommunityApp> {
  @ManyToOne(() => HnCommunityApp, (app) => app.appFiles, { nullable: false, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
