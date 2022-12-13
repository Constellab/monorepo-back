import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaUser} from '../../../model/entities/ca-user.class';
import {CaSpaceRole} from '../../../model/entities/space/ca-space-user.class';
import {Type} from 'class-transformer';


export class CaSpaceUserSearchFields {

  firstname: string;

  lastname: string;

  email: string;

  role: CaSpaceRole;

  active: boolean;

  @Type(() => CaUser)
  addedBy: CaUser;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;
}

export class CaSpaceUserSearch {

  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<CaSpaceUserSearchFields> = {
    firstname: 'firstname',
    lastname: 'lastname',
    email: 'email',
    role: 'role',
    active: 'active_license',
    addedBy: 'space_user_added_by',
    createdAt: 'creation_date',
  };

  public static advancedSearchConverter: FlSearchCriteriaConverter<CaSpaceUserSearchFields> = {
    firstname: {key: 'user.firstname', operator: 'MATCH'},
    lastname: {key: 'user.lastname', operator: 'MATCH'},
    email: {key: 'user.email', operator: 'MATCH'},
    role: {key: 'role', operator: 'EQ'},
    active: {key: 'active', operator: 'EQ'},
    addedBy: {key: 'addedBy.id', operator: 'EQ', convertValue: FlSearchConverter.getEntityId},
    createdAt: FlSearchConverter.dateInterval('createdAt'),
  };

  public static getAdvancedSearchForm(): FormGroup<CaSpaceUserSearchFields> {
    return new FormBuilder().group<CaSpaceUserSearchFields>({
      firstname: null,
      lastname: null,
      email: null,
      role: null,
      active: null,
      addedBy: null,
      createdAt: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
    });
  }
}
