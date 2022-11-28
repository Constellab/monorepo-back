import {DateTime} from 'luxon';

export interface BlNotification{
  id: string;

  user: any;

  link: string;

  isRead: boolean;

  objectId: string;

  objectType: string;

  space: any;

  createdBy: any;

  createdAt: DateTime;
}
