import {TdIOSpec} from '@monorepo/technical-doc';

/**
 * Spec for the input or output of a process
 */
export class PrIO {

  resource_id?: string;

  specs: TdIOSpec;

  constructor(io?: TdIOSpec) {
    this.specs = io;
  }
}
