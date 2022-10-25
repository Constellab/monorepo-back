import { Test, TestingModule } from '@nestjs/testing';
import { CnNotificationController } from './cn-notification.controller';
import { CnNotificationService } from './cn-notification.service';

describe('CnNotificationController', () => {
  let controller: CnNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnNotificationController],
      providers: [CnNotificationService],
    }).compile();

    controller = module.get<CnNotificationController>(CnNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
