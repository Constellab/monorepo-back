import {DateTime} from 'luxon';

export interface BlNotification{
  id: string;

  user: any;

  link: string;

  isRead: boolean;

  objectId: string;

  objectType: string;

  organization: any;

  createdBy: any;

  createdAt: DateTime;
}
