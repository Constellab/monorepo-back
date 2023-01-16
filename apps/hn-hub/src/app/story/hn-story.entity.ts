import {Column, Entity, ManyToMany} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {HnTopic} from '../label/hn-topic.entity';
import {JoinTable} from 'typeorm';

@Entity('Story')
export class HnStory extends HnBaseEntity {
  @Column()
  title: string;

  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any> = CmRichText.newRichText();

  @Column({nullable: true})
  mainPicture?: string;

  @ManyToMany(() => HnTopic, topic => topic.stories, {cascade: ["insert", "update"]})
  @JoinTable()
  topics: HnTopic[];

  init(title: string, content: CmRichTextI, labels: HnTopic[]): void {
    this.content = content;
    this.title = title;
    this.topics = labels;
  }
}
