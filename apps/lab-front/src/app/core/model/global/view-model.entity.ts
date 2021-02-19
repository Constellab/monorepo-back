import {LabBaseEntity} from './lab-entity.entity';
import {Transform} from 'class-transformer';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {typeToClassMap} from '../../utils/type-to-class.map';

export class ViewModel<T extends LabBaseEntity> extends LabBaseEntity {

  type: 'gws.model.ViewModel';

  @ViewModelTransform()
  model: T;
}


/**
 * Transform decorator for ViewModel
 * @constructor
 */
function ViewModelTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (viewModel: ViewModel<any>) => ClCoreJsonConvert.serialize(viewModel),
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (entity: LabBaseEntity) => modelToClass(entity),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

/**
 * Instantiate the model property class of ViewModel
 * @param entity
 */
function modelToClass(entity: LabBaseEntity): LabBaseEntity {
  if (entity == null) {
    console.error('The view model doesn\'t have a model property', entity);
    return null;
  }
  if (entity.type == null) {
    console.error('The model of view model model doesn\'t have a type property', entity);
    return null;
  }

  const type: string = entity.type;

  if (!typeToClassMap.has(type)) {
    console.error(`The type ${type} does not exist in typeToClassMap`, entity);
    return null;
  }
  return ClCoreJsonConvert.deserialize(entity, typeToClassMap.get(type));
}
