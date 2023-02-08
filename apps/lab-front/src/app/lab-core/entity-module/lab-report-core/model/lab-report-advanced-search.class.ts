import {Type} from 'class-transformer';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabProject} from '../../../model/entities/lab-project.class';


export class LabReportSearchFields {
  title: string;
  @Type(() => LabProject)
  project: LabProject[];

  createdBy: string[];

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
    project: 'biox.project',
    // group the creation date into one chip
    createdAt: 'creation_date',
    createdBy: 'created_by',
    lastModifiedAt: 'last_modified_date',
    isValidated: 'biox.report_is_validated',
    isArchived: 'is_archived',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabReportSearchFields> = {
    title: {key: 'title', operator: 'CONTAINS'},
    project: {key: 'project', operator: 'IN', convertValue: FlSearchConverter.getEntitiesId},
    // Date
    createdBy: {key: 'created_by', operator: 'IN'},
    createdAt: FlSearchConverter.dateInterval('created_at'),
    lastModifiedAt: FlSearchConverter.dateInterval('last_modified_at'),
    isArchived: {key: 'is_archived', operator: 'EQ', convertValue: LabSearchConverter.includeAllOnCheck},
    isValidated: {key: 'is_validated', operator: 'EQ', convertValue: LabSearchConverter.includeAllOnCheck},
  };


  public static getAdvancedSearchForm(): FormGroup<LabReportSearchFields> {
    return new FormBuilder().group(
      {
        title: [null],
        project: [null],
        createdBy: [null],
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
