import {LabBaseEntity} from '../../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {TypedTree} from '../../global/typed-tree.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export class BioxLabTypeEntity extends LabBaseEntity {
  @Expose({name: 'typing_name'})
  typingName: string;

  @Expose({name: 'model_name'})
  modelName: string;

  @Expose({name: 'human_name'})
  humanName?: string;


  get name(): string {
    return this.humanName || this.modelName;
  }
}

/**
 * Tree that group the typed entities by model type
 */
export type BioxLabTypeEntityTree = TypedTree<BioxLabTypeEntity>;

export type BioxLabTypeEntityDatasource = FlEntityPaginatedDatasource<BioxLabTypeEntity>
