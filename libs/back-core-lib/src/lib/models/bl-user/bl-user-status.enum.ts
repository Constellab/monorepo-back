/**
 * Different status of a user account
 */
export enum BlUserStatus{
  // Just after subscription, the user need to validate his email
  WAITING_FOR_EMAIL = 'WAITING_FOR_EMAIL',

  // Lock by an admin, the user can't log on
  LOCKED_BY_ADMIN = 'LOCKED_BY_ADMIN',

  // The user account is ready
  READY = 'READY',
}
