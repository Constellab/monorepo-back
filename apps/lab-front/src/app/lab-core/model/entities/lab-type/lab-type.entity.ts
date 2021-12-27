import {LabBaseEntity} from '../../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {LabTypedTree} from '../../global/lab-typed-tree.class';

export class LabTypeEntity extends LabBaseEntity {
  @Expose({name: 'typing_name'})
  typingName: string;

  @Expose({name: 'model_name'})
  modelName: string;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription?: string;

  get name(): string {
    return this.humanName || this.modelName;
  }
}

/**
 * Tree that group the typed entities by model type
 */
export type LabTypeEntityTree = LabTypedTree<LabTypeEntity>;

