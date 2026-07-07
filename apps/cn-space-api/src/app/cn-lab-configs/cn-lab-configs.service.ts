import { BlAbstractService, BlBadRequestException, BlVersion } from '@monorepo/back-core-lib';
import { ClHelpService } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CnBrickGWS, CnBrickVersionDTO, CnBrickVersionTechnicalKey } from '../cn-bricks/cn-brick.dto';
import { CnBrickVersion } from '../cn-bricks/cn-brick-version.entity';
import { CnBricksService } from '../cn-bricks/cn-bricks.service';
import { CnLabConfigDTO } from '../cn-labs/cn-lab.dto';
import { CnLab } from '../cn-labs/cn-lab.entity';
import { CnLabConfigDto } from './cn-lab-config.dto';
import { CnLabConfig } from './cn-lab-config.entity';
import { CnLabConfigFile, CnLabConfigFileEnv } from './cn-lab-config-file.class';

@Injectable()
export class CnLabConfigsService extends BlAbstractService<CnLabConfig> {
  constructor(
    @InjectRepository(CnLabConfig) private repository: Repository<CnLabConfig>,
    private brickService: CnBricksService,
    private datasource: DataSource
  ) {
    super(repository, CnLabConfig);
  }

  public findAll(): Promise<CnLabConfig[]> {
    return this.repository.find({
      order: { label: 'ASC' },
    });
  }

  public async getOrCreateLabConfig(labConfigDto: CnLabConfigDto): Promise<CnLabConfig> {
    const hash = this.hashBrickVersion(labConfigDto.brick_versions);

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
    return await this.datasource.transaction(async (entityManager) => {
      for (const version of labConfigDto.brick_versions) {
        const brickVersion = await this.brickService.getBrickVersionAndCheck(
          version.name,
          BlVersion.fromString(version.version)
        );
        labConfig.brickVersions.push(brickVersion);
      }

      await entityManager.save(labConfig);
      return labConfig;
    });
  }

  private findByBrickVersionHash(brickVersionHash: number): Promise<CnLabConfig | null> {
    return this.repository.findOne({
      where: { brickVersionsHash: brickVersionHash },
    });
  }

  private hashBrickVersion(brickVersions: CnBrickVersionDTO[]): number {
    // create an object that is always formatted the same to create a hash
    const sortedVersions = ClHelpService.sortAlphabeticalOrder(brickVersions, (a) => a.name).map(
      (version) => ({
        name: version.name,
        version: version.version,
      })
    );

    return this.hash(JSON.stringify(sortedVersions));
  }

  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;

    return h;
  }

  public async getCompleteConfig(labConfigId: string): Promise<CnLabConfig> {
    return await this.findByIdAndCheck(labConfigId, {
      brickVersions: { brick: true },
    });
  }

  public async getLabBrickVersion(labConfigId: string, brick_name: string): Promise<CnBrickVersion | null> {
    const labConfig = await this.repository.findOne({
      where: {
        id: labConfigId,
        brickVersions: { brick: { name: brick_name } },
      },
      relations: { brickVersions: { brick: true } },
    });
    if (!labConfig) {
      throw new BlBadRequestException(`The brick '${brick_name}' is not in the lab config`);
    }
    return labConfig.brickVersions.find((brickVersion) => brickVersion.brick.name === brick_name);
  }

  /**
   * Get the gws_core brick version installed on a data lab (from its lab config).
   * Returns null if the lab has no config or gws_core is not in it.
   */
  public async getGwsCoreVersion(lab: CnLab): Promise<CnBrickVersion | null> {
    if (!lab.labConfigId) {
      return null;
    }

    return this.getLabBrickVersion(lab.labConfigId, CnBrickGWS.GWS_CORE);
  }

  /**
   * Get the gws_core brick version installed on a data lab (from its lab config).
   * Throws if the lab has no config or gws_core is not in it.
   */
  public async getGwsCoreVersionAndCheck(lab: CnLab): Promise<CnBrickVersion> {
    const gwsCoreVersion = await this.getGwsCoreVersion(lab);
    if (!gwsCoreVersion) {
      throw new BlBadRequestException(
        `The brick '${CnBrickGWS.GWS_CORE}' is not in the config of lab '${lab.name}'`
      );
    }
    return gwsCoreVersion;
  }

  //////////////////////////////////// CONFIG FILE ////////////////////////////////////////

  /**
   * Generate the json for the config file of a lab
   * @param lab
   * @param config
   */
  public async getLabConfigFile(lab: CnLab, config: CnLabConfigDTO): Promise<CnLabConfigFile> {
    // get gws_core version
    const gwsCoreBrickVersion = await this.getGwsCoreBrickVersion(config);

    // get the front version from the technical info
    const frontVersion = gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_FRONT_VERSION];
    if (frontVersion == null) {
      throw new BlBadRequestException(
        `The front version does not exists for '${CnBrickGWS.GWS_CORE}'` +
          ` version '${gwsCoreBrickVersion.version.toString()},'`
      );
    }

    // use the version in the gws_core brick version
    if (!gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_GLAB_VERSION]) {
      throw new BlBadRequestException('Glab version is not set in the gws_core brick version');
    }
    const glabVersion = gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_GLAB_VERSION];

    const biotaMariaDbUrl = await this.getMariaDbUrl(config);

    return {
      lab_id: lab.id,
      name: lab.name,
      front_version: frontVersion,
      glab_tag: glabVersion,
      biota_maria_db_url: biotaMariaDbUrl,
      variables: {},
      environment: await this.brickConfigToConfigEnv(config.brickVersions),
    };
  }

  private async getGwsCoreBrickVersion(config: CnLabConfigDTO): Promise<CnBrickVersion> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(
      (brickVersion) => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase()
    );

    if (gwsCore == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    // retrieve the lab front version
    const gwsCoreVersion = BlVersion.fromString(gwsCore.version);
    // get gws_core version
    return await this.brickService.getBrickVersionAndCheck(CnBrickGWS.GWS_CORE, gwsCoreVersion);
  }

  // @deprecated From version 0.11.0 of biota, this is not used anymore
  private async getMariaDbUrl(config: CnLabConfigDTO): Promise<string | null> {
    // get the maria db url
    const gwsBiota = config.brickVersions.find(
      (brickVersion) => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_BIOTA.toLowerCase()
    );
    if (gwsBiota == null) {
      return null;
    }
    // get gws_core version
    const gwsBiotaBrickVersion = await this.brickService.getBrickVersion(
      CnBrickGWS.GWS_BIOTA,
      BlVersion.fromString(gwsBiota.version)
    );

    if (!gwsBiotaBrickVersion.technicalInfo) {
      return null;
    }

    return gwsBiotaBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_BIOTA_MARIA_DB_URL];
  }

  private async brickConfigToConfigEnv(brickVersions: CnBrickVersionDTO[]): Promise<CnLabConfigFileEnv> {
    const labConfig: CnLabConfigFileEnv = { bricks: [], git: [], pip: [], variables: {} };

    for (const brick of brickVersions) {
      const brickVersion = await this.brickService.getBrickVersionAndCheck(
        brick.name,
        BlVersion.fromString(brick.version)
      );

      labConfig.bricks.push({
        name: brick.name,
        version: brickVersion.version.toString(),
      });
    }

    return labConfig;
  }

  public configFileToLabConfig(configFile: CnLabConfigFile): CnLabConfigDTO {
    if (configFile == null) {
      return {
        brickVersions: [],
      };
    }

    const config: CnLabConfigDTO = {
      brickVersions: [],
    };

    for (const brick of configFile.environment?.bricks ?? []) {
      config.brickVersions.push({
        name: brick.name,
        version: brick.version,
      });
    }
    return config;
  }
}
