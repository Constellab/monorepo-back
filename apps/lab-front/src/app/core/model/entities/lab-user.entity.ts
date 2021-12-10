import {FlEntity} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {LabBaseEntity} from '../global/lab-entity.entity';

export class LabUser implements FlEntity {
  id: string;

  email: string;

  @Expose({name: 'first_name'})
  firstname: string;

  @Expose({name: 'first_name'})
  lastname: string;

  get fullname(): string {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  }

  public toString(): string {
    return this.fullname;
  }
}

export class LabBaseEntityWithUser extends LabBaseEntity {

  @Expose({name: 'created_by'})
  @Type(() => LabUser)
  createdBy: LabUser;

  @Expose({name: 'last_modified_by'})
  @Type(() => LabUser)
  lastModifiedBy: LabUser;
}

