import {ClSupportedLanguage} from '@monorepo/core-lib';

export interface BlUser {

  id: string;
  email: string;
  firstname: string;
  lastname: string;
  lang: ClSupportedLanguage;

}

export interface BlUserDto{
  id: string;
}
