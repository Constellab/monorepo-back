// template of mail that can be sent by the lab
export type CnLabMailTemplate = 'scenario-finished';

export class CnLabSendMailDto {
  receiver_ids: string[];
  mail_template: CnLabMailTemplate;
  data?: Record<string, any>;
  subject?: string;
}
