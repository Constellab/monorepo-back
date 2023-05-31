// template of mail that can be sent by the lab
export type CnLabInstanceMailTemplate = 'experiment-finished'

export class CnLabInstanceSendMailDto {
  receiver_ids: string[];
  mail_template: CnLabInstanceMailTemplate;
  data?: Record<string, any>;
  subject?: string;
}

