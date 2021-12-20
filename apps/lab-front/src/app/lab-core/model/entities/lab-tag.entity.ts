import {FlTag, FlTagEntity} from '@monorepo/front-core-lib';
import {LabEntity} from '../global/lab-entity.entity';

/**
 * Object representing the tag
 */
export class LabTag implements FlTag {
  key: string;
  value: string;
}

/**
 * Object representing the tags entity
 */
export class LabTagEntity extends LabEntity implements FlTagEntity {
  key: string;
  values: string[];
}

