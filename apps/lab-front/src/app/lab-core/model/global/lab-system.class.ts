import {Expose} from 'class-transformer';

export class LabSystemInfo {

  @Expose({name: 'lab_name'})
  labName: string;

  @Expose({name: 'front_version'})
  frontVersion: string;

}
