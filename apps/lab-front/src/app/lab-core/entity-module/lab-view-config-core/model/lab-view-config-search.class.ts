import {Type} from 'class-transformer';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabResourceViewType} from '../../../model/entities/resource/lab-resource-view.entity';

export class LabViewConfigSearchFields {
  title: string;

  viewType: LabResourceViewType;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

}

export class LabViewConfigSearch {
  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabViewConfigSearchFields> = {
    title: 'title',
    viewType: 'biox.view_type',
    // group the creation date into one chip
    createdAt: 'creation_date',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabViewConfigSearchFields> = {
    title: {key: 'title', operator: 'CONTAINS'},
    viewType: {key: 'view_type', operator: 'EQ'},
    // Date
    createdAt: FlSearchConverter.dateInterval('created_at'),
  };


  public static getAdvancedSearchForm(): FormGroup<LabViewConfigSearchFields> {
    return new FormBuilder().group(
      {
        title: [null],
        viewType: [null],
        createdAt: new FormBuilder().group<FlSearchDateInterval>({
          from: [null],
          to: [null],
        })
      }
    );
  }
}
