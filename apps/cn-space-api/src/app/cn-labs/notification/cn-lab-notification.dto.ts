export interface CnLabNotificationCreateDTO {
  receiver_ids: string[];
  text: string;
  link?: string;
  associated_object_ids?: string[];
}
