/**
 * configuration object for the mail, store in env variables
 */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

/**
 * List of available mail template
 */
export enum MailTemplate {
  account_locked = 'account_locked',
  signup = 'signup',
  password_forgotten = 'password_forgotten'
}
