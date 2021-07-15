import {BioxResource} from './biox-resource.entity';
import {BioxNetwork, bioxResourceNetworkType} from './biox-network.class';
import {FileResource} from './file-resource.entity';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {BioModel, bioxResourceBioModelType} from './bio-model.class';

/**
 * Helper to manage network resource and retrieve networks form it
 */
export class BioxResourceNetworkHelper {

  /**
   * return true if the resource is a network
   */
  public static resourceIsNetwork(resource: BioxResource): boolean {
    if (resource.type === bioxResourceNetworkType || resource.type === bioxResourceBioModelType) {
      return true;
    }

    // if the resource is a file containing a network resource
    if (resource instanceof FileResource && resource.dataIsLabEntity() &&
      resource.data.type === bioxResourceNetworkType) {
      return true;
    }

    // check if the resource is a network without explicite type
    const data: FlBioNetwork = resource.data;
    // check the attribute as if the resource is a pathway
    return data != null && typeof data === 'object' && Array.isArray(data.metabolites)
      && Array.isArray(data.reactions) && typeof data.compartments === 'object';
  }

  /**
   * retrieve the network object form the network resource
   */
  public static getNetworksFromResource(resource: BioxResource): FlBioNetwork | FlBioNetwork[] {
    if (resource instanceof FileResource) {
      // if the resource file containing a network resource
      if (resource.dataIsLabEntity()) {
        // call the method with the BioxResource inside the file resource
        return BioxResourceNetworkHelper.getNetworksFromResource(resource.data as BioxResource);
      } else {
        // if the resource is a file containing directly the network json
        return resource.data;
      }
      // if the resource is a network
    } else if (resource.type === bioxResourceNetworkType) {
      return (resource as BioxNetwork).data.network;
    } else if (resource.type === bioxResourceBioModelType) {
      return (resource as BioModel).data.biomodel.networks.map(networkResource => networkResource.data.network);
    } else {
      throw new Error('The resource is not a network');
    }
  }

}
