import {Expose} from 'class-transformer';

export class LabSystemInfo {

  @Expose({name: 'lab_name'})
  labName: string;

}
