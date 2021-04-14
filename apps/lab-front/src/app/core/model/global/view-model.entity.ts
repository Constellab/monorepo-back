import {LabBaseEntity} from './lab-entity.entity';
import {Transform} from 'class-transformer';
import {ClClassReference, ClConstructorFunction, ClCoreJsonConvert} from '@monorepo/core-lib';
import {typeToClassMap} from '../../utils/type-to-class.map';
import {FlPage} from '@monorepo/front-core-lib';

export class ViewModel<T extends LabBaseEntity> extends LabBaseEntity {

  type: 'gws.model.ViewModel';

  model: T;
}

export type ViewModelPage<T extends LabBaseEntity> = FlPage<ViewModel<T>>;

/**
 * Function to instantiate the view model and instantiate the model under it
 * @param modelClassReference class reference of the model under the view model
 */
export function createViewModel<T extends LabBaseEntity>(modelClassReference: ClClassReference<T>)
  : ClConstructorFunction<ViewModel<T> | ViewModel<T>[]> {
  return (json: any): ViewModel<T> | ViewModel<T>[] => {
    // instantiate the view model or view models
    const viewModel: ViewModel<T> | ViewModel<T>[] = ClCoreJsonConvert.deserialize(json, ViewModel) as any;

    // if this is an array
    if (viewModel instanceof Array) {
      // instantiate all the model
      for (const model of viewModel) {
        model.model = ClCoreJsonConvert.deserializeObject(model.model, modelClassReference);
      }
    } else {
      viewModel.model = ClCoreJsonConvert.deserializeObject(viewModel.model, modelClassReference);
    }
    return viewModel;
  };
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

  if (typeToClassMap[type] == null) {
    console.error(`The type ${type} does not exist in typeToClassMap`, entity);
    return null;
  }
  return ClCoreJsonConvert.deserialize(entity, typeToClassMap[type]);
}

