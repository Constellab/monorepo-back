import {HnUser} from './hn-user.entity';

export class HnUserDto {
  id: string;
  firstname: string;
  lastname: string;
  photo: string;

  constructor(user: HnUser) {
    this.id = user.id;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.photo = user.photo;
  }
}
