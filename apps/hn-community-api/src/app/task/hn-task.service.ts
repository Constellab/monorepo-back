import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as TASKS_OF_THE_DAY from '../../assets/data/tasks-of-the-day.json';
import { HnImportTaskDTO } from '../brick-aggregate/brick/hn-brick.dto';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnTechnicalFolder } from '../technical-folder/hn-technical-folder.entity';
import { HnTask } from './hn-task.entity';

@Injectable()
export class HnTaskService {
  tasksOfTheDay: HnTask[];

  constructor(
    @InjectRepository(HnTask)
    private readonly tasksRepository: Repository<HnTask>
  ) {
    this.tasksOfTheDay = TASKS_OF_THE_DAY.map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value as HnTask);
  }

  async deleteByTechnicalFolder(technicalFolderId: string): Promise<void> {
    await this.tasksRepository.delete({ technicalFolder: { id: technicalFolderId } });
  }

  async createTechnicalDocTasks(
    technicalFolder: HnTechnicalFolder,
    tasks: HnImportTaskDTO[]
  ): Promise<boolean> {
    // Deduplicate by unique_name, last entry wins
    const deduped = [...new Map(tasks.map((t) => [t.unique_name, t])).values()];

    for (const t of deduped) {
      const task = new HnTask();
      task.shortDescription = t.short_description ? t.short_description : null;
      task.doc = t.doc;
      task.brickName = technicalFolder.brickMajorVersion.brick.name;
      task.technicalFolder = technicalFolder;
      task.hide = t.hide;
      task.brickMajor = technicalFolder.brickMajorVersion.major;
      task.uniqueName = t.unique_name;
      task.typingName = t.typing_name;
      task.style = t.style;
      task.humanName = t.human_name;

      //TODO A MODIFIER pour le deprecatedSince

      if (t.parent) {
        task.parentTypingName = t.parent.typing_name;
        task.parentHumanName = t.parent.human_name;
        task.parentMajorVersion = +t.parent.brick_version.split('.')[0];
        task.parentVersion = t.parent.brick_version;
      }
      task.deprecatedSince = t.deprecated_since;
      task.deprecatedMessage = t.deprecated_message;
      task.shortDescription = t.short_description;
      task.objectSubType = t.object_sub_type;

      if (t.input_specs && Object.keys(t.input_specs).length > 0) {
        task.inputSpecs = t.input_specs;
      }

      if (t.output_specs && Object.keys(t.output_specs).length > 0) {
        task.outputSpecs = t.output_specs;
      }

      if (t.config_specs && Object.keys(t.config_specs).length > 0) {
        task.configSpecs = t.config_specs;
      }

      if (t.additional_info && Object.keys(t.additional_info).length > 0) {
        task.additionalInfo = t.additional_info;
      }

      await this.tasksRepository.save(task);
    }

    return true;
  }

  async findTasks(technicalFolderId: string): Promise<HnTask[]> {
    return this.tasksRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolderId,
        },
      },
      order: {
        humanName: 'ASC',
      },
    });
  }

  async findCurrentTecDoc(
    tecFolder: HnTechnicalFolder,
    uniqueName: string
  ): Promise<HnGeneratedDocEntity | null> {
    const task: HnTask | null = await this.tasksRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id,
      },
      uniqueName: uniqueName,
    });
    if (task != null) {
      task.objectType = 'TASK';
    }

    return task;
  }

  async findTechDocById(id: string): Promise<HnTask | null> {
    return this.tasksRepository.findOneBy({ id });
  }

  //Get a task in the array tasksOfTheDay according to the day number
  async getTaskOfTheDay(): Promise<HnTask | null> {
    const dayNumber: number = Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000));
    let i: number = dayNumber % this.tasksOfTheDay.length;
    let task: HnTask | null = await this.findTaskOfTheDay(
      this.tasksOfTheDay[i].uniqueName,
      this.tasksOfTheDay[i].brickName
    );
    while (task == null && i + 1 < this.tasksOfTheDay.length) {
      i = i + 1;
      task = await this.findTaskOfTheDay(this.tasksOfTheDay[i].uniqueName, this.tasksOfTheDay[i].brickName);
    }
    return task;
  }

  async findTaskOfTheDay(uniqueName: string, brickName: string): Promise<HnTask | null> {
    return this.tasksRepository.findOne({
      where: {
        uniqueName: uniqueName,
        brickName: brickName,
      },
    });
  }
}
