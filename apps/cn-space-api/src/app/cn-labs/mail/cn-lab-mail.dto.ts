import { BlTrim } from '@monorepo/back-core-lib';

// template of mail that can be sent by the lab
export type CnLabMailTemplate = 'scenario-finished' | 'generic';

export class CnLabSendMailDto {
  receiver_ids: string[];
  mail_template: CnLabMailTemplate;
  data?: Record<string, any>;
  @BlTrim()
  subject?: string;
}

export class CnLabSendMailToMailsDto {
  receiver_mails: string[];
  mail_template: CnLabMailTemplate;
  data?: Record<string, any>;
  @BlTrim()
  subject?: string;
}

export class CnSendMailToSupportDto {
  @BlTrim()
  content: string;

  @BlTrim()
  subject: string;

  data?: Record<string, any>;
}
