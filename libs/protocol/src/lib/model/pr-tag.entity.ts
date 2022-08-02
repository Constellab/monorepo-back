import {FlTag, FlTagEntity} from '@monorepo/front-core-lib';
import {PrEntity} from './pr-entity.entity';

/**
 * Object representing the tag
 */
export class PrTag implements FlTag {
  key: string;
  value: string;
}

/**
 * Object representing the tags entity
 */
export class PrTagEntity extends PrEntity implements FlTagEntity {
  key: string;
  values: string[];

  clone(): PrTagEntity {
    const clone = new PrTagEntity();
    clone.id = this.id;
    clone.key = this.key;
    clone.values = this.values;
    return clone;
  }
}

