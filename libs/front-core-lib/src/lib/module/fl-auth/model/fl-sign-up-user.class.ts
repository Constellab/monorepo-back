import {CmUserCategory} from '@monorepo/common-model';

export interface FlSignUpUser {
  firstname: string;
  lastname: string;
  email: string;
  category: CmUserCategory;
  password: string;
  repeatPassword: string;
  validateCGU: boolean;
  phone ?: string;
}
