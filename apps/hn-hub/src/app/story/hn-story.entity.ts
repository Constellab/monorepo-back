import {Column, Entity, ManyToMany} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {HnLabel} from '../label/hn-label.entity';
import {JoinTable} from 'typeorm/browser';

@Entity('story')
export class HnStory extends HnBaseEntity {
  @Column()
  title: string;

  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any> = CmRichText.newRichText();

  @Column({nullable: true})
  mainPicture?: string;

  @ManyToMany(() => HnLabel, label => label.stories, {cascade: ["insert", "update"]})
  @JoinTable()
  labels: HnLabel[];

  init(title: string, content: CmRichTextI, labels: HnLabel[]): void {
    this.content = content;
    this.title = title;
    this.labels = labels;
  }
}
