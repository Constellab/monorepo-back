import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';
import {Column} from 'typeorm';
import {BlRichText} from '@monorepo/back-core-lib';

export abstract class HnAbstractCommentEntity extends HnBaseEntity {

  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any> = BlRichText.newRichText();
}
