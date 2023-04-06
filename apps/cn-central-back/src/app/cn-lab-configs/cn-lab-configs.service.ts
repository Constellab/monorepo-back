import {Injectable} from '@nestjs/common';
import {CnLabConfig} from './cn-lab-config.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {CnLabConfigDto} from './cn-lab-config.dto';
import {ClHelpService} from '@monorepo/core-lib';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';
import {CnBrickGWS, CnBrickVersionDTO, CnBrickVersionTechnicalKey} from '../cn-bricks/cn-brick.dto';
import {CmVersion} from '@monorepo/common-model';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnLabInstanceConfigDTO} from '../cn-lab-instances/cn-lab-instance.dto';
import {CnConfigFileEnvRepository, CnLabConfigFile, CnLabConfigFileEnv} from './cn-lab-config-file.class';
import {CnBrickVersion, CnRepoType} from '../cn-bricks/cn-brick-version.entity';

@Injectable()
export class CnLabConfigsService extends BlAbstractService<CnLabConfig> {

  constructor(@InjectRepository(CnLabConfig) private repository: Repository<CnLabConfig>,
              private brickService: CnBricksService,
              private datasource: DataSource) {
    super(repository, CnLabConfig);
  }

  public findAll(): Promise<CnLabConfig[]> {
    return this.repository.find({
      order: {label: 'ASC'}
    });
  }

  public async getOrCreateLabConfig(labConfigDto: CnLabConfigDto): Promise<CnLabConfig> {
    const hash = await this.hashBrickVersion(labConfigDto.brick_versions);

    const labConfig = await this.findByBrickVersionHash(hash);

    if (labConfig) {
      return labConfig;
    }

    return this.createLabConfig(labConfigDto, hash);
  }

  private async createLabConfig(labConfigDto: CnLabConfigDto, hash: number): Promise<CnLabConfig> {
    const labConfig: CnLabConfig = new CnLabConfig();
    labConfig.brickVersionsHash = hash;
    labConfig.label = '';
    labConfig.brickVersions = [];
    return await this.datasource.transaction(async entityManager => {

      for (const version of labConfigDto.brick_versions) {
        const brickVersion = await this.brickService.getBrickVersionAndCheck(version.name, CmVersion.fromString(version.version));
        labConfig.brickVersions.push(brickVersion);
      }

      await entityManager.save(labConfig);
      return labConfig;
    });
  }

  private findByBrickVersionHash(brickVersionHash: number): Promise<CnLabConfig | null> {
    return this.repository.findOne({
      where: {brickVersionsHash: brickVersionHash}
    });
  }

  private async hashBrickVersion(brickVersions: CnBrickVersionDTO[]): Promise<number> {
    // create an object that is always formatted the same to create a hash
    const sortedVersions = ClHelpService.sortAlphabeticalOrder(brickVersions, a => a.name).map(
      version => ({
        name: version.name,
        version: version.version
      })
    );

    return this.hash(JSON.stringify(sortedVersions));
  }


  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++)
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;

    return h;
  }

  public async getCompleteConfig(labConfigId: string): Promise<CnLabConfig> {
    return await this.findById(labConfigId, {
      brickVersions: {brick: true}
    });
  }

  ////////////////////////////////////////////// CONFIG FILE ////////////////////////////////////////////////////

  /**
   * Generate the json for the config file of a lab
   * @param labInstance
   * @param config
   */
  public async getLabConfigFile(labInstance: CnLabInstance, config: CnLabInstanceConfigDTO): Promise<CnLabConfigFile> {

    // get gws_core version
    const gwsCoreBrickVersion = await this.getGwsCoreBrickVersion(config);

    // get the front version from the technical info
    const frontVersion = gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_FRONT_VERSION];
    if (frontVersion == null) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(`The front version does not exists for '${CnBrickGWS.GWS_CORE}' version '${gwsCoreBrickVersion.version}'`);
    }

    // use the version set in the config, or by default version link to the gws_core brick version
    // or use the latest version
    const glabVersion = config.glabTag ||
      gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_GLAB_VERSION] || 'latest';

    const biotaMariaDbUrl = await this.getMariaDbUrl(config);

    return {
      lab_id: labInstance.id,
      name: labInstance.name,
      front_version: frontVersion,
      glab_tag: glabVersion,
      biota_maria_db_url: biotaMariaDbUrl,
      variables: {},
      environment: await this.brickConfigToConfigEnv(config.brickVersions),
    };
  }

  private async getGwsCoreBrickVersion(config: CnLabInstanceConfigDTO): Promise<CnBrickVersion> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase());

    if (gwsCore == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    // retrieve the lab front version
    const gwsCoreVersion = CmVersion.fromString(gwsCore.version);
    // get gws_core version
    return await this.brickService.getBrickVersion(CnBrickGWS.GWS_CORE, gwsCoreVersion);
  }

  private async getMariaDbUrl(config: CnLabInstanceConfigDTO): Promise<string> {
    // get the maria db url
    const gwsBiota = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_BIOTA.toLowerCase());
    if (gwsBiota == null) {
      return null;
    }
    // get gws_core version
    const gwsBiotaBrickVersion = await this.brickService.getBrickVersion(CnBrickGWS.GWS_BIOTA,
      CmVersion.fromString(gwsBiota.version));

    const biotaMariaDbUrl = gwsBiotaBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_BIOTA_MARIA_DB_URL];
    if (biotaMariaDbUrl == null) {
      throw new BlBadRequestException(`The maria db url does not exists for '${CnBrickGWS.GWS_BIOTA}' version '${gwsBiota.version}'`);
    }

    return biotaMariaDbUrl;
  }

  private async brickConfigToConfigEnv(brickVersions: CnBrickVersionDTO[]): Promise<CnLabConfigFileEnv> {
    const labConfig: CnLabConfigFileEnv = {git: [], pip: [], variables: {}};


    for (const brick of brickVersions) {
      const brickVersion = await this.brickService.getBrickVersionAndCheck(brick.name, CmVersion.fromString(brick.version));

      // add the package to the right place
      let packageEnvs: CnConfigFileEnvRepository[];

      if (brickVersion.repoType === CnRepoType.PIP) {
        packageEnvs = labConfig.pip;
      } else {
        packageEnvs = labConfig.git;
      }

      // create the package env with the right source if it doesn't exist
      if (packageEnvs.findIndex(git => git.source === brickVersion.repoType) < 0) {
        packageEnvs.push({
          source: brickVersion.getRepo(),
          packages: []
        });
      }

      // retrieve the package en with repo
      const packageEnv = packageEnvs.find(git => git.source === brickVersion.getRepo());
      // add the brick into the repo
      packageEnv.packages.push({
        name: brick.name,
        version: brickVersion.version.toString(),
        is_brick: true,
        is_hidden: true, // force all bricks to be hidden
      });
    }

    return labConfig;
  }

  public configFileToLabInstanceConfig(configFile: CnLabConfigFile): CnLabInstanceConfigDTO {
    if (configFile == null) {
      return {
        glabTag: 'latest',
        brickVersions: [],
      };
    }

    const config: CnLabInstanceConfigDTO = {
      glabTag: configFile.glab_tag,
      brickVersions: [],
    };

    for (const env of [...configFile.environment?.pip ?? [], ...configFile.environment?.git ?? []]) {
      for (const brick of env.packages) {
        if (brick.is_brick) {
          config.brickVersions.push({
            name: brick.name,
            version: brick.version,
          });
        }
      }
    }

    return config;
  }

}
