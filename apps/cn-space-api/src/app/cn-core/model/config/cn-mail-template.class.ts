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
  request_app = 'cn-request-app',
  two_factor_authentication = 'cn-two-factor-authentication',
  request_lab = 'cn-request-lab',
  folder_notification = 'cn-folder-notification',
  lab_started = 'cn-lab-started',

  // mail for the support
  support_lab_start_error = 'cn-support-lab-start-error',
  support_lab_backup_error = 'cn-support-lab-backup-error',
  support_lab_temp_status_limit_reached = 'cn-support-lab-temp-status-limit-reached',

  // Mail send by the lab
  scenario_finished = 'cn-scenario-finished',

  // Other
  generic = 'cn-generic',
}
