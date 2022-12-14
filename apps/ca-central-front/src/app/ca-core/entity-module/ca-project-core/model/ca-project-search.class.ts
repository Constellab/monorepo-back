import {Type} from 'class-transformer';
import {CaUser} from '../../../model/entities/ca-user.class';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaProjectStatus} from '../../../model/entities/ca-project.class';

export class CaProjectSearchFields {

  code: string;

  title: string;

  @Type(() => FlSearchDateInterval)
  startingDate: FlSearchDateInterval;

  @Type(() => FlSearchDateInterval)
  endingDate: FlSearchDateInterval;

  currentStatus: CaProjectStatus;

  @Type(() => CaUser)
  leader: CaUser;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;

  includeSubProjects: boolean;
}

export class CaProjectSearch {

  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<CaProjectSearchFields> = {
    code: 'code',
    title: 'title',
    startingDate: 'starting_date',
    endingDate: 'ending_date',
    currentStatus: 'status',
    leader: 'project_leader',
    createdAt: 'creation_date',
    includeSubProjects: 'include_sub_projects'
  };

  public static advancedSearchConverter: FlSearchCriteriaConverter<CaProjectSearchFields> = {
    code: {key: 'name', operator: 'MATCH'},
    title: {key: 'name', operator: 'MATCH'},
    startingDate: FlSearchConverter.dateInterval('startingDate'),
    endingDate: FlSearchConverter.dateInterval('endingDate'),
    currentStatus: {key: 'currentStatus.status', operator: 'EQ'},
    leader: {key: 'createdBy.id', operator: 'EQ', convertValue: FlSearchConverter.getEntityId},
    createdAt: FlSearchConverter.dateInterval('createdAt'),
    includeSubProjects: {key: 'includeSubProjects', operator: 'EQ'},
  };

  public static getAdvancedSearchForm(): FormGroup<CaProjectSearchFields> {
    return new FormBuilder().group<CaProjectSearchFields>({
      code: null,
      title: null,
      startingDate: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
      endingDate: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
      currentStatus: null,
      leader: null,
      createdAt: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
      includeSubProjects: null,
    });
  }
}
