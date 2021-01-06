import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';

/**
 * A brick is a functionality to configure a Lab
 * A lab is configured with multiple bricks
 */
@JsonObject('Brick')
export class Brick extends BaseEntity {

  @JsonProperty('label', String)
  label: string = null;
}
