import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval,
  FlTag,
  FlTagHelper
} from '@monorepo/front-core-lib';
import {LabExperimentStatus, LabExperimentType} from '../../../model/entities/lab-experiment.entity';
import {Type} from 'class-transformer';
import {LabProject} from '../../../model/entities/lab-project.class';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';


export class LabExperimentSearchFields {
  text: string;

  type: LabExperimentType;
  status: LabExperimentStatus;
  tags: FlTag[];
  project: LabProject[];

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

  @Type(() => FlSearchDateInterval)
  lastModifiedAt: FlSearchDateInterval;
  isValidated: boolean;
  isArchived: boolean;

}

export class LabExperimentSearch {
  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabExperimentSearchFields> = {
    text: 'biox.experiment_text',
    type: 'biox.experiment_type',
    tags: 'flTag.tags',
    project: 'biox.project',
    isArchived: 'is_archived',
    // group the creation date into one chip
    createdAt: 'creation_date',
    lastModifiedAt: 'last_modified_date',
    isValidated: 'biox.experiment_is_validated',
  };


  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabExperimentSearchFields> = {
    text: {key: 'text', operator: 'MATCH'},
    type: {key: 'type', operator: 'EQ'},
    status: {key: 'status', operator: 'IN'},
    tags: {key: 'tags', operator: 'EQ', convertValue: FlTagHelper.tagsToString},
    project: {key: 'project', operator: 'IN', convertValue: FlSearchConverter.getEntitiesId},
    // Date
    createdAt: FlSearchConverter.dateInterval('created_at'),
    lastModifiedAt: FlSearchConverter.dateInterval('last_modified_at'),
    isArchived: {key: 'is_archived', operator: 'EQ', convertValue: LabSearchConverter.convertArchived},
    isValidated: {key: 'is_validated', operator: 'EQ', convertValue: LabSearchConverter.convertValidated},
  };

  public static getAdvancedSearchForm(): FormGroup<LabExperimentSearchFields> {
    return new FormBuilder().group(
      {
        text: [null],
        type: [null],
        status: [null],
        tags: [null],
        project: [null],
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
