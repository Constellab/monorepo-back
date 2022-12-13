import {CmUserCategory} from '@monorepo/common-model';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Type} from 'class-transformer';


export class CaUserSearchFields {

  firstname: string;

  lastname: string;

  email: string;

  category: CmUserCategory[];

  company: string;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;
}

export class CaUserSearch {

  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<CaUserSearchFields> = {
    firstname: 'firstname',
    lastname: 'lastname',
    email: 'email',
    category: 'user_category',
    company: 'company',
    createdAt: 'creation_date',
  };

  public static advancedSearchConverter: FlSearchCriteriaConverter<CaUserSearchFields> = {
    firstname: {key: 'firstname', operator: 'MATCH'},
    lastname: {key: 'lastname', operator: 'MATCH'},
    email: {key: 'email', operator: 'MATCH'},
    category: {key: 'category', operator: 'IN'},
    company: {key: 'company', operator: 'MATCH'},
    createdAt: FlSearchConverter.dateInterval('createdAt'),
  };

  public static getAdvancedSearchForm(): FormGroup<CaUserSearchFields> {
    return new FormBuilder().group<CaUserSearchFields>({
      firstname: null,
      lastname: null,
      email: null,
      category: null,
      company: null,
      createdAt: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
    });
  }
}
