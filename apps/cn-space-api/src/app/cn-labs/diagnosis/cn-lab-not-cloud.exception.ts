import { BlBadRequestException } from '@monorepo/back-core-lib';

import { CnLabType } from '../cn-lab.entity';

/**
 * A start diagnosis was asked for a lab that has no cloud server.
 *
 * Its own type rather than a plain bad request because the caller has to be able to say what
 * *does* apply to this lab instead, and the list of alternatives depends on the caller: an
 * HTTP client and an MCP client name different things. The lab type travels with the
 * exception so neither has to load the lab again to say it.
 *
 * A desktop lab has no server, volume, ssh or cloud provider at all — four of the six layers
 * do not exist for it, and reporting them would produce a confidently wrong verdict.
 */
export class CnLabNotCloudException extends BlBadRequestException {
  /**
   * @param message an alternative wording. A caller that knows what else is available to *its*
   * audience re-throws with that, keeping the type — and therefore keeping the refusal
   * recognisable — while replacing a message that would not help the reader.
   */
  constructor(
    public readonly labType: CnLabType,
    message?: string
  ) {
    super(message ?? `The start diagnosis only applies to a cloud lab. This lab is ${labType}.`);
  }
}
