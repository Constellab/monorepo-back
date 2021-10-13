import {LabBaseEntity} from './lab-entity.entity';
import {ClClassReference, ClConstructorFunction, ClCoreJsonConvert, ClPageI} from '@monorepo/core-lib';

export class ViewModel<T extends LabBaseEntity> extends LabBaseEntity {

  type: 'gws.model.ViewModel';

  model: T;

  id: '';
}

export type ViewModelPage<T extends LabBaseEntity> = ClPageI<ViewModel<T>>;

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

