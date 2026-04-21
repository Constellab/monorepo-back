import { BlNotFoundException } from '@monorepo/back-core-lib';

/**
 * Exception thrown when a cloud server instance is not found in the cloud provider.
 * This typically means the VM was deleted externally.
 */
export class CnInstanceNotFoundException extends BlNotFoundException {
  constructor(instanceId: string, provider: string) {
    super(
      `Cloud instance ${instanceId} not found on provider ${provider}. ` +
        `It may have been deleted externally.`
    );
  }
}
