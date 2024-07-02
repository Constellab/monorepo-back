import {HnUser} from './hn-user.entity';

export class HnUserDto {
  id: string;
  alias: string;
  userCode: string;
  photo: string;

  constructor(user: HnUser) {
    this.id = user.id;
    this.alias = user.alias;
    this.userCode = user.userCode;
    this.photo = user.photo;
  }
}

export class HnUserDetailDto{
  id: string;
  alias: string;
  userCode: string;
  firstname: string;
  lastname: string;
  photo: string;
  githubLink: string;
  linkedinLink: string;
  xLink: string;
  interests: string;

  constructor(user: HnUser) {
    this.id = user.id;
    this.alias = user.alias;
    this.userCode = user.userCode;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.photo = user.photo;
    this.githubLink = user.githubLink;
    this.linkedinLink = user.linkedinLink;
    this.xLink = user.xLink;
    this.interests = user.interests;
  }
}

export class HnUserEditDetailDto{
  id: string;
  alias: string;
  githubLink: string;
  linkedinLink: string;
  xLink: string;
  interests: string;
}
