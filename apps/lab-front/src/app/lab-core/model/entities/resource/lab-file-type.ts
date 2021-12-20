import {Expose} from 'class-transformer';
import {LabTypeEntity} from '../lab-type/lab-type.entity';


export class LabFileType extends LabTypeEntity {

  @Expose({name: 'supported_extensions'})
  supportedExtensions: string[];

  // return true if the provided extension is supported by the type
  public extensionIsSupported(extension: string): boolean {
    return this.supportedExtensions?.includes(extension) ?? false;
  }
}
