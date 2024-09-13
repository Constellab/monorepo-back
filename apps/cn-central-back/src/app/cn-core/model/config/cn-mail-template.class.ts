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
  folder_notification = 'cn-folder-notification',
  lab_started = 'cn-lab-started',

  // mail for the support
  support_lab_start_error = 'cn-support-lab-start-error',
  support_lab_backup_error = 'cn-support-lab-backup-error',

  // Mail send by the lab
  experiment_finished = 'cn-experiment-finished',

  // Other
  generic = 'cn-generic'
}
