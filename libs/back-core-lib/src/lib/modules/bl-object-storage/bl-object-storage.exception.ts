import { BlBadRequestException } from '../../exceptions/bl-bad-request.exception';


export class BlLabS3ServerNotAvailableException extends BlBadRequestException {
  constructor() {
    super('The s3 server of the datahub is not available. Please check the datahub status.');
  }
}
