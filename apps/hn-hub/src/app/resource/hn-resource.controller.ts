import {Controller,} from '@nestjs/common';
import {HnResourceService} from './hn-resource.service';

@Controller('resource')
export class HnResourceController {
  constructor(private readonly resourceService: HnResourceService) {
  }



}
