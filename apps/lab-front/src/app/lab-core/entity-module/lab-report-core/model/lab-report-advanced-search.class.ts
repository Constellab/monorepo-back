import {Type} from 'class-transformer';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';


export class LabReportSearchFields {
  title: string;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

  @Type(() => FlSearchDateInterval)
  lastModifiedAt: FlSearchDateInterval;

  isValidated: boolean;
  isArchived: boolean;

}

export class LabReportSearch {
  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabReportSearchFields> = {
    title: 'title',
    // group the creation date into one chip
    createdAt: 'creation_date',
    lastModifiedAt: 'last_modified_date',
    isValidated: 'biox.report_is_validated',
    isArchived: 'is_archived',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabReportSearchFields> = {
    title: {key: 'title', operator: 'CONTAINS'},
    // Date
    createdAt: FlSearchConverter.dateInterval('created_at'),
    lastModifiedAt: FlSearchConverter.dateInterval('last_modified_at'),
    isArchived: {key: 'is_archived', operator: 'EQ', convertValue: LabSearchConverter.convertArchived},
    isValidated: {key: 'is_validated', operator: 'EQ', convertValue: LabSearchConverter.convertValidated},
  };


  public static getAdvancedSearchForm(): FormGroup<LabReportSearchFields> {
    return new FormBuilder().group(
      {
        title: [null],
        createdAt: new FormBuilder().group<FlSearchDateInterval>({
          from: [null],
          to: [null],
        }),
        lastModifiedAt: new FormBuilder().group<FlSearchDateInterval>({
          from: [null],
          to: [null],
        }),
        isArchived: [null],
        isValidated: [null],
      }
    );
  }
}
