import {BaseEntity} from './base-entity.class';

/**
 * A brick is a functionality to configure a Lab
 * A lab is configured with multiple bricks
 */
export class Brick extends BaseEntity {

  label: string;
}
