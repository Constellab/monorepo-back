import {FlEntity} from '../../../model/fl-entity.class';

export interface FlUser extends FlEntity{
  firstname: string;

  lastname: string;

  email: string;

  photo?: string;

  fullname: string;

  biography?: string;

  company?: string;

  activity?: string;

}
