import {Controller} from '@nestjs/common';
import {CnCloudProvidersService} from './cn-cloud-providers.service';

@Controller('cloud-providers')
export class CnCloudProvidersController {

  constructor(private service: CnCloudProvidersService) {
  }
}
