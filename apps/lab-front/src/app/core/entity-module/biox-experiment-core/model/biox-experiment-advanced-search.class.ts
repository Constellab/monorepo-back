import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval,
  FlTag,
  FlTagHelper
} from '@monorepo/front-core-lib';
import {BioxExperimentStatus, BioxExperimentType} from '../../../model/entities/biox-experiment.entity';
import {Type} from 'class-transformer';
import {BioxStudy} from '../../../model/entities/biox-study.class';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';


export class BioxExperimentSearchFields {
  text: string;

  type: BioxExperimentType;
  status: BioxExperimentStatus;
  tags: FlTag[];
  study: BioxStudy[];

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

  @Type(() => FlSearchDateInterval)
  lastModifiedAt: FlSearchDateInterval;
  isValidated: boolean;
  isArchived: boolean;

}

export class BioxExperimentSearch {
  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<BioxExperimentSearchFields> = {
    text: 'biox.experiment_text',
    type: 'biox.experiment_type',
    tags: 'flTag.tags',
    study: 'biox.study',
    isArchived: 'is_archived',
    // group the creation date into one chip
    createdAt: 'creation_date',
    lastModifiedAt: 'last_modified_date',
    isValidated: 'biox.experiment_is_validated',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<BioxExperimentSearchFields> = {
    text: {key: 'text', operator: 'MATCH'},
    type: {key: 'type', operator: 'EQ'},
    status: {key: 'status', operator: 'IN'},
    tags: {key: 'tags', operator: 'EQ', convertValue: FlTagHelper.tagsToString},
    study: {key: 'study', operator: 'IN', convertValue: FlSearchConverter.getEntitiesId},
    // Date
    createdAt: FlSearchConverter.dateInterval('created_at'),
    lastModifiedAt: FlSearchConverter.dateInterval('last_modified_at'),
    isArchived: {key: 'is_archived', operator: 'EQ', convertValue: LabSearchConverter.convertArchived},
    isValidated: {key: 'is_validated', operator: 'EQ', convertValue: BioxExperimentSearch.convertValidated},
  };

  /**
   * Search converter for archived checkbox. If check, return no filter (search on archived and not archived)
   * If null or false, only search on non archived objets
   * @param archived
   */
  private static convertValidated(archived: boolean): boolean | null {
    if (!archived) {
      return false;
    } else {
      return null;
    }
  }


  public static getAdvancedSearchForm(): FormGroup<BioxExperimentSearchFields> {
    return new FormBuilder().group(
      {
        text: [null],
        type: [null],
        status: [null],
        tags: [null],
        study: [null],
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
