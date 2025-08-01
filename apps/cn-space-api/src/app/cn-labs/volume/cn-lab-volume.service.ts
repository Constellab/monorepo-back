import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';

import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnLabUpdateVolumeDTO } from './cn-lab-volume.dto';
import { CnLabVolume, CnLabVolumeEntity, CnLabVolumeType } from './cn-lab-volume-entity';

@Injectable()
export class CnLabVolumeService extends BlAbstractService<CnLabVolumeEntity> {
  constructor(
    @InjectRepository(CnLabVolumeEntity) repository: Repository<CnLabVolumeEntity>,
    private datasource: DataSource
  ) {
    super(repository, CnLabVolumeEntity);
  }

  public async createVolume(
    lab: CnLab,
    startDate: DateTime,
    size: number,
    type: CnLabVolumeType,
    entityManage: EntityManager
  ): Promise<CnLabVolumeEntity> {
    const volume = new CnLabVolumeEntity();
    volume.lab = lab as CnLabEntity;
    volume.size = size;
    volume.type = type;
    volume.startDate = startDate;
    return this.save(volume, entityManage);
  }

  public async updateLabVolume(lab: CnLab, updateVolume: CnLabUpdateVolumeDTO): Promise<CnLabVolume> {
    return this.datasource.transaction(async (entityManager) => {
      const volume = await this.getCurrentVolume(lab.id);

      if (updateVolume.startDate < volume.startDate) {
        throw new BlBadRequestException(
          'The new volume start date date must be after the last volume start date.'
        );
      }
      volume.endDate = updateVolume.startDate;
      await this.update(volume as CnLabVolumeEntity, entityManager);

      return this.createVolume(
        lab,
        updateVolume.startDate,
        updateVolume.size,
        updateVolume.type,
        entityManager
      );
    });
  }

  /**
   * Set the lab volume to 0
   * @param lab
   * @param startDate
   */
  public async markVolumeAsDeleted(lab: CnLab, startDate: DateTime): Promise<CnLabVolume> {
    const currentVolume = await this.getCurrentVolume(lab.id);
    if (currentVolume.size === 0) return currentVolume;
    return this.updateLabVolume(lab, {
      startDate: startDate,
      size: 0,
      type: currentVolume.type,
    });
  }

  public async deleteLabVolume(labId: string, volumeId: string): Promise<void> {
    const volume = await this.findByIdAndCheck(volumeId);

    const volumes = await this.repo.find({
      where: { lab: { id: labId } },
      order: { startDate: 'ASC' },
    });

    if (volumes.length <= 1) {
      throw new BlBadRequestException('Cannot delete the last volume.');
    }

    const priceIndex = volumes.findIndex((p) => p.id === volumeId);

    if (priceIndex === 0) {
      const nextPrice = volumes[priceIndex + 1];
      nextPrice.startDate = volume.startDate;
      await this.datasource.transaction(async (entityManager) => {
        await this.update(nextPrice, entityManager);
        await this.deleteById(volumeId, entityManager);
      });
      return;
    }

    const previousPrice = volumes[priceIndex - 1];
    previousPrice.endDate = volume.endDate;

    await this.datasource.transaction(async (entityManager) => {
      await this.update(previousPrice, entityManager);
      await this.deleteById(volumeId, entityManager);
    });
  }

  public async getCurrentVolume(labId: string): Promise<CnLabVolume> {
    return this.repo.findOneBy({ lab: { id: labId }, endDate: IsNull() });
  }

  public async getVolumeHistory(labId: string, page: number, size: number): Promise<ClPage<CnLabVolume>> {
    return this.findPaginated(page, size, {
      where: { lab: { id: labId } },
      order: { startDate: 'DESC' },
    });
  }

  public async getAllVolumes(labId: string): Promise<CnLabVolume[]> {
    return this.repo.find({
      where: { lab: { id: labId } },
      order: { startDate: 'ASC' },
    });
  }
}
