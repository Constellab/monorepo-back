import {FlEntity} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {PrBaseEntity} from './pr-entity.entity';

export class PrUser implements FlEntity {
  id: string;

  email: string;

  @Expose({name: 'first_name'})
  firstname: string;

  @Expose({name: 'last_name'})
  lastname: string;

  theme: ClTheme;

  lang: ClSupportedLanguage;

  get fullname(): string {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  }

  public toString(): string {
    return this.fullname;
  }
}

export class PrBaseEntityWithUser extends PrBaseEntity {

  @Expose({name: 'created_by'})
  @Type(() => PrUser)
  createdBy: PrUser;

  @Expose({name: 'last_modified_by'})
  @Type(() => PrUser)
  lastModifiedBy: PrUser;
}
