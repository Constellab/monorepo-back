import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { ClStringHelper } from '@monorepo/core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { HnCommunityAppEditDto } from './hn-community-app.dto';
import { HnFileApp } from '../../file-aggregate/file-app/hn-file-app.entity';

@Entity('app')
export class HnCommunityApp extends HnBaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ name: 'description', type: 'simple-json', nullable: true })
  description?: TeRichTextDTO;

  @Column({ nullable: true })
  picture?: string;

  @Column({ name: 'app_url' })
  @Index({ unique: true })
  appUrl: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ default: 0 })
  executions: number;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  space?: HnSpace;

  @OneToMany(() => HnFileApp, (appFile) => appFile.entity, { nullable: true })
  appFiles: HnFileApp[];

  static isValidAppUrl(appUrl: string): boolean {
    if (!ClStringHelper.isHttpLink(appUrl)) return false;

    const urlWithoutHttp: string = appUrl.replace('http://', '').replace('https://', '');
    const urlFragment: string[] = urlWithoutHttp.split('/');
    return urlFragment.length > 0 && urlFragment[0].endsWith('.constellab.app');
  }

  updateFromDto(dto: HnCommunityAppEditDto, space: HnSpace): void {
    this.title = dto.title;
    this.appUrl = dto.appUrl;
    this.picture = dto.picture;
    this.description = dto.description;
    this.space = space;
  }
}
