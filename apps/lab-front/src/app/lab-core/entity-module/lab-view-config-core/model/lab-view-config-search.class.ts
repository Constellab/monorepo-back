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

  viewType: LabResourceViewType[];

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

}

export class LabViewConfigSearch {
  // list of the view types that are not searchable
  public static excludedViewTypes: LabResourceViewType[] = ['tabular-view', 'dataset-view', 'view', 'image-view', 'folder-view',
    'resources-list-view'];

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
    viewType: {key: 'view_type', operator: 'IN', convertValue: LabViewConfigSearch.viewTypeConverter},
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


  /**
   * Simple converter for the view type param to add similar view type when a type is selected
   * @param viewTypes
   * @private
   */
  private static viewTypeConverter(viewTypes: LabResourceViewType[]): LabResourceViewType[] {
    if (viewTypes == null) return null;
    const vT: LabResourceViewType[] = [...viewTypes];
    if (vT.includes('table-view')) {
      vT.push('tabular-view', 'dataset-view');
    }

    return vT;
  }

}
