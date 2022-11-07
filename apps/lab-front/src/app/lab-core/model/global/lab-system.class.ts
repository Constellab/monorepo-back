import {Expose, Type} from 'class-transformer';

export class LabOrganization {
  id: string;
  label: string;
  domain: string;
  photo?: string;
}

export class LabSystemInfo {

  @Expose({name: 'lab_name'})
  labName: string;

  @Expose({name: 'front_version'})
  frontVersion: string;

  @Type(() => LabOrganization)
  organization: LabOrganization;

}
