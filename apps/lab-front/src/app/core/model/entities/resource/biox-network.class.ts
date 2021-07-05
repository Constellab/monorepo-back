import {BioxBasicResource} from './biox-resource.entity';
import {FlBioNetwork} from '@monorepo/front-core-lib';

export const bioxResourceNetworkType: string = 'gena.network.Network';

/**
 * Resource representing a patwhay
 */
export type BioxNetwork = BioxBasicResource<BioxNetworkData>;

export interface BioxNetworkData {
  title: string;
  description: string;
  network: FlBioNetwork;
}
