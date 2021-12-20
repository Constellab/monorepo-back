import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval,
  FlTag,
  FlTagHelper
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {Type} from 'class-transformer';
import {LabResourceOrigin} from '../../../model/entities/resource/lab-resource.entity';

/**
 * Format of the data for the Advanced search form of the resource
 */
export class LabResourceSearchFields {
  resourceTypingName: string[];
  name: string;
  tags: FlTag[];
  origin: LabResourceOrigin;
  data: string;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;
  isArchived: boolean;
}


export class LabResourceSearch {

  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabResourceSearchFields> = {
    resourceTypingName: 'resource_type',
    tags: 'flTag.tags',
    origin: 'resource_origin',
    data: 'resource_data',
    isArchived: 'is_archived',
    // group the creation date into one chip
    createdAt: 'creation_date',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabResourceSearchFields> = {
    resourceTypingName: {key: 'resource_typing_name', operator: 'IN'},
    name: {key: 'name', operator: 'CONTAINS'},
    tags: {key: 'tags', operator: 'EQ', convertValue: FlTagHelper.tagsToString},
    origin: {key: 'origin', operator: 'EQ'},
    data: {key: 'data', operator: 'MATCH'},
    // Date
    createdAt: FlSearchConverter.dateInterval('created_at'),
    isArchived: {key: 'is_archived', operator: 'EQ', convertValue: LabSearchConverter.convertArchived},
  };


  public static getAdvancedSearchForm(): FormGroup<LabResourceSearchFields> {
    const createAtFormGroup: FormGroup<FlSearchDateInterval> = new FormBuilder().group({
      from: [null],
      to: [null],
    });

    return new FormBuilder().group(
      {
        resourceTypingName: [null],
        name: [null],
        tags: [null],
        origin: [null],
        data: [null],
        createdAt: createAtFormGroup,
        isArchived: [null]
      }
    );
  }


}
