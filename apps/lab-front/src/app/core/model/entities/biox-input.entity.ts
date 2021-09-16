import {UnconvertedResource} from './resource/biox-resource.entity';

/**
 * Spec for the input or output of a task
 */
export class BioxInput {

  resource: UnconvertedResource;

  specs: string[];

  public static fromSpecs(specs: string[]): BioxInput{
    const input: BioxInput = new BioxInput();
    input.specs = specs;
    input.resource = {uri: '', typing_name: ''};
    return input;
  }
}

