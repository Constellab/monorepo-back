import {Injectable} from '@nestjs/common';
import {CnServerDecisionTreeDTO, CnServerDecisionTreeOptionDTO, CnSettings} from './cn-settings.entity';
import {BlAbstractService, BlBadRequestException, BlFile, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';


@Injectable()
export class CnSettingsService extends BlAbstractService<CnSettings> {

  constructor(@InjectRepository(CnSettings) private repository: Repository<CnSettings>) {
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
    } catch (e) {
      throw new BlBadRequestException('Invalid JSON file');
    }

    // check the tree
    this.checkServerDecisionTree(tree.tree);

    await this.updateSettings({serverDecisionTree: tree});
  }

  private checkServerDecisionTree(treeOptions: CnServerDecisionTreeOptionDTO[]): void {
    if (!treeOptions || treeOptions.length === 0) {
      throw new BlBadRequestException('Invalid decision tree, empty children');
    }

    treeOptions.forEach(option => {
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


  ///////////////////////////////// GENERIC /////////////////////////////////

  public async updateSettings(settings: Partial<CnSettings>): Promise<CnSettings> {
    this.checkAuthorizationToUpdate();

    const currentSettings = await this.getSettingsAndCheck();
    return await this.updatePartial(currentSettings.id, settings);
  }

  public async getSettingsAndCheck(): Promise<CnSettings> {
    const settings = await this.repository.find({});

    if (settings.length === 0) {
      throw new BlBadRequestException('Settings not found');
    }

    return settings[0];
  }


  private checkAuthorizationToUpdate(): void {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
  }
}
