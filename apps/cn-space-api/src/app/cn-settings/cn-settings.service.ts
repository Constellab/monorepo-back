import {
  BlAbstractService,
  BlBadRequestException,
  BlFile,
  BlMailService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnConstellabSuiteAppDTO,
  CnConstellabSuiteDTO,
  CnFreeLabConfigDTO,
  CnRequestAppDTO,
  CnServerDecisionTreeDTO,
  CnServerDecisionTreeOptionDTO,
  CnSettings,
} from './cn-settings.entity';

@Injectable()
export class CnSettingsService extends BlAbstractService<CnSettings> {
  constructor(
    @InjectRepository(CnSettings) private repository: Repository<CnSettings>,
    private mailService: BlMailService,
    private configService: CnCoreConfigService
  ) {
    super(repository, CnSettings);
  }

  ///////////////////////////////// SERVER DECISION TREE /////////////////////////////////

  public async getServerDecisionTree(): Promise<CnServerDecisionTreeDTO> {
    const settings = await this.getSettingsAndCheck();

    return settings.serverDecisionTree;
  }

  public async updateServerDecisionTree(file: BlFile): Promise<void> {
    // read the file
    let tree: CnServerDecisionTreeDTO;

    try {
      tree = JSON.parse(file.buffer.toString());
    } catch {
      throw new BlBadRequestException('Invalid JSON file');
    }

    // check the tree
    this.checkServerDecisionTree(tree.tree);

    await this.updateSettings({ serverDecisionTree: tree });
  }

  private checkServerDecisionTree(treeOptions: CnServerDecisionTreeOptionDTO[]): void {
    if (!treeOptions || treeOptions.length === 0) {
      throw new BlBadRequestException('Invalid decision tree, empty children');
    }

    treeOptions.forEach((option) => {
      if (!option.title || !option.description) {
        throw new BlBadRequestException('Invalid decision tree, missing title or description');
      }

      if (option.children) {
        this.checkServerDecisionTree(option.children);
      } else if (!option.suggestedServerNames || option.suggestedServerNames.length === 0) {
        throw new BlBadRequestException('Invalid decision tree, no children nor suggested server names');
      }
    });
  }

  ///////////////////////////////// CONSTELLAB SUITE /////////////////////////////////

  public async getConstellabSuite(): Promise<CnConstellabSuiteDTO> {
    const settings = await this.getSettingsAndCheck();

    return settings.constellabSuite ?? { apps: [] };
  }

  public async updateConstellabSuite(file: BlFile): Promise<void> {
    // read the file
    let constellabSuite: CnConstellabSuiteDTO;

    try {
      constellabSuite = JSON.parse(file.buffer.toString());
    } catch {
      throw new BlBadRequestException('Invalid JSON file');
    }

    // check the constellab suite
    this.checkConstellabSuite(constellabSuite.apps);

    await this.updateSettings({ constellabSuite });
  }

  private checkConstellabSuite(apps: CnConstellabSuiteAppDTO[]): void {
    if (!apps || apps.length === 0) {
      throw new BlBadRequestException('Invalid constellab suite, empty apps list');
    }

    apps.forEach((app) => {
      if (!app.name || !app.emoji || !app.background || !app.shortDescription) {
        throw new BlBadRequestException(
          'Invalid constellab suite, missing name, emoji, background or shortDescription '
        );
      }
    });
  }

  ///////////////////////////////// FREE LAB CONFIG /////////////////////////////////

  public async getFreeLabConfig(): Promise<CnFreeLabConfigDTO> {
    const settings = await this.getSettingsAndCheck();

    return settings.freeLabConfig ?? CnSettings.getDefaultFreeLabConfig();
  }

  public async updateFreeLabConfig(freeLabConfig: CnFreeLabConfigDTO): Promise<CnFreeLabConfigDTO> {
    await this.updateSettings({ freeLabConfig });

    return freeLabConfig;
  }

  ///////////////////////////////// REQUEST APP /////////////////////////////////

  public async requestApp(requestAppDto: CnRequestAppDTO): Promise<void> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();

    const customerSuccessMail = this.configService.getCustomerSuccessMail();
    if (!customerSuccessMail) {
      throw new BlBadRequestException('No customer success email configured');
    }

    const data = {
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      spaceName: space.name,
      appName: requestAppDto.appName,
    };

    await this.mailService.sendMailAndCheck({
      templateName: CnMailTemplate.request_app,
      recipients: customerSuccessMail,
      lang: user.lang,
      data: data,
    });
  }

  ///////////////////////////////// GENERIC /////////////////////////////////

  public async updateSettings(settings: Partial<CnSettings>): Promise<CnSettings> {
    this.checkAuthorizationToUpdate();

    const currentSettings = await this.getSettingsAndCheck();
    return await this.updatePartial(currentSettings.id, settings);
  }

  public async getSettingsAndCheck(): Promise<CnSettings> {
    const settings = await this.repository.find({});

    if (settings.length === 0) {
      const settings = CnSettings.createDefault();
      return await this.repository.save(settings);
    }

    return settings[0];
  }

  private checkAuthorizationToUpdate(): void {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
  }
}
