import {TdIOSpec} from '@monorepo/technical-doc';


/**
 * Specific node for the interface that only has one output port
 * Its name correspond to the port name
 */
export interface PrInterface {

  name: string;
  // name of the single output port set by the ConnectionManager
  portName: string;

  // types supported by the port
  portType: TdIOSpec;
}

/**
 * Specific node for the outerface that only has one input port
 * Its name correspond to the port name
 */
export type PrOuterface = PrInterface;


