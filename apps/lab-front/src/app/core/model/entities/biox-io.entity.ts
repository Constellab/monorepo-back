import {UnconvertedResource} from './resource/biox-resource.entity';

export interface BioxIOSpec {
  typing_name: string;
  human_name: string;
  short_description: string;
}

/**
 * Spec for the input or output of a process
 */
export class BioxIO {

  resource: UnconvertedResource;

  specs: BioxIOSpec[];
}

