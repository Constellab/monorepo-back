
/**
 * List of available mail template
 */
export enum CnMailTemplate {
  account_locked = 'cn-account-locked',
  signup = 'cn-signup',
  signup_validated = 'cn-signup-validated',
  password_forgotten = 'cn-password-forgotten',
  space_invit_new_user = 'cn-space-invit-new-user',
  space_invit_existing_user = 'cn-space-invit-existing-user',
  request_new_licenses = 'cn-request-new-licenses',
  two_factor_authentication = 'cn-two-factor-authentication',
  request_lab_instance = 'cn-request-lab-instance',

  // Mail send by the lab
  experiment_finished = 'cn-experiment-finished'
}
