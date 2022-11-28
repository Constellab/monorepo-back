import {Expose, Type} from 'class-transformer';

export class LabSpace {
  id: string;
  name: string;
  domain: string;
  photo?: string;
}

export class LabSystemInfo {

  @Expose({name: 'lab_name'})
  labName: string;

  @Expose({name: 'front_version'})
  frontVersion: string;

  @Type(() => LabSpace)
  space: LabSpace;

}
