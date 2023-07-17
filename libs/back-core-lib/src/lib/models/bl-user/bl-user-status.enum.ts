/**
 * Different status of a user account
 */
export enum BlUserStatus{
  // Just after subscription, the user need to validate his email
  WAITING_FOR_EMAIL = 'WAITING_FOR_EMAIL',

  // After email validation, an admin must validate the account
  WAITING_FOR_ADMIN = 'WAITING_FOR_ADMIN',

  // The user can log on but he will need to fill more information
  INCOMPLETE = 'INCOMPLETE',

  // The user account is ready to user
  READY = 'READY'
}
