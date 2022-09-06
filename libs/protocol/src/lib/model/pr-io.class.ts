import {TdIOSpec} from '@monorepo/technical-doc';

/**
 * Spec for the input or output of a process
 */
export interface PrIO {

  resource_id?: string;

  specs: TdIOSpec;

}
