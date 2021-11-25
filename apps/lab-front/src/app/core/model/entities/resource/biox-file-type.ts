import {Expose} from 'class-transformer';
import {BioxLabTypeEntity} from '../lab-type/biox-lab-type.entity';


export class BioxFileType extends BioxLabTypeEntity {

  @Expose({name: 'supported_extensions'})
  supportedExtensions: string[];

  // return true if the provided extension is supported by the type
  public extensionIsSupported(extension: string): boolean {
    return this.supportedExtensions?.includes(extension) ?? false;
  }
}
