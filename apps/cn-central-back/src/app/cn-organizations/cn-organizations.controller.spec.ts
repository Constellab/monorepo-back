import {Test, TestingModule} from '@nestjs/testing';
import {CnOrganizationsController} from './cn-organizations.controller';

describe('OrganizationsController', () => {
  let controller: CnOrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnOrganizationsController],
    }).compile();

    controller = module.get<CnOrganizationsController>(CnOrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
