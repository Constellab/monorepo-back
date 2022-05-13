import { Test, TestingModule } from '@nestjs/testing';
import { HnProtocolController } from './hn-protocol.controller';
import { HnProtocolService } from './hn-protocol.service';

describe('ProtocolController', () => {
  let controller: HnProtocolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnProtocolController],
      providers: [HnProtocolService],
    }).compile();

    controller = module.get<HnProtocolController>(HnProtocolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
