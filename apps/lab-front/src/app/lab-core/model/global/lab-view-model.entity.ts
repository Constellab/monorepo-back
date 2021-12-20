import {LabBaseEntity} from './lab-entity.entity';
import {ClClassReference, ClConstructorFunction, ClCoreJsonConvert, ClPageI} from '@monorepo/core-lib';

export class LabViewModel<T extends LabBaseEntity> extends LabBaseEntity {

  type: 'gws.model.ViewModel';

  model: T;

  id: '';
}

export type LabViewModelPage<T extends LabBaseEntity> = ClPageI<LabViewModel<T>>;

/**
 * Function to instantiate the view model and instantiate the model under it
 * @param modelClassReference class reference of the model under the view model
 */
export function labCreateViewModel<T extends LabBaseEntity>(modelClassReference: ClClassReference<T>)
  : ClConstructorFunction<LabViewModel<T> | LabViewModel<T>[]> {
  return (json: any): LabViewModel<T> | LabViewModel<T>[] => {
    // instantiate the view model or view models
    const viewModel: LabViewModel<T> | LabViewModel<T>[] = ClCoreJsonConvert.deserialize(json, LabViewModel) as any;

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

