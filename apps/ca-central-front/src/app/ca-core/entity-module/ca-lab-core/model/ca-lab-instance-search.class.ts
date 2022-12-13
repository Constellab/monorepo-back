import {Type} from 'class-transformer';
import {CaUser} from '../../../model/entities/ca-user.class';
import {
  FlFormInputsManagerConfig,
  FlSearchConverter,
  FlSearchCriteriaConverter,
  FlSearchDateInterval
} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaLabInstanceStatus} from '../../../model/entities/ca-lab-instance.class';
import {CaCity} from '../../../model/entities/ca-city.entity';
import {CaServerInfo} from '../../../model/entities/ca-server-info.class';


export class CaLabInstanceSearchFields {

  name: string;

  currentStatus: CaLabInstanceStatus;

  virtualHost: string;

  @Type(() => CaCity)
  city: CaCity;

  @Type(() => CaServerInfo)
  serverInfo: CaServerInfo;

  @Type(() => CaUser)
  createdBy: CaUser;

  @Type(() => FlSearchDateInterval)
  createdAt: FlSearchDateInterval;
}

export class CaLabInstanceSearch {

  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<CaLabInstanceSearchFields> = {
    name: 'name',
    currentStatus: 'status',
    virtualHost: 'virtual_host',
    city: 'region',
    serverInfo: 'server_info',
    createdBy: 'created_by',
    createdAt: 'creation_date',
  };

  public static advancedSearchConverter: FlSearchCriteriaConverter<CaLabInstanceSearchFields> = {
    name: {key: 'name', operator: 'MATCH'},
    currentStatus: {key: 'currentStatus.status', operator: 'EQ'},
    virtualHost: {key: 'virtualHost', operator: 'MATCH'},
    city: {key: 'city.id', operator: 'EQ', convertValue: FlSearchConverter.getEntityId},
    serverInfo: {key: 'serverInfo.id', operator: 'EQ', convertValue: FlSearchConverter.getEntityId},
    createdBy: {key: 'createdBy.id', operator: 'EQ', convertValue: FlSearchConverter.getEntityId},
    createdAt: FlSearchConverter.dateInterval('createdAt'),
  };

  public static getAdvancedSearchForm(): FormGroup<CaLabInstanceSearchFields> {
    return new FormBuilder().group<CaLabInstanceSearchFields>({
      name: null,
      currentStatus: null,
      virtualHost: null,
      city: null,
      serverInfo: null,
      createdBy: null,
      createdAt: new FormBuilder().group<FlSearchDateInterval>({
        from: [null],
        to: [null],
      }),
    });
  }
}
