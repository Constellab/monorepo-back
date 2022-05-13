import { Controller } from '@nestjs/common';
import { HnProtocolService } from './hn-protocol.service';

@Controller('protocol')
export class HnProtocolController {
  constructor(private readonly protocolService: HnProtocolService) {}
}
