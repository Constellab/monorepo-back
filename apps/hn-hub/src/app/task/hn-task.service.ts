import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnTask} from './hn-task.entity';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportTaskDTO} from '../brick/hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import * as TASKS_OF_THE_DAY from '../../assets/data/tasks-of-the-day.json';

@Injectable()
export class HnTaskService {

  tasksOfTheDay: HnTask[];

  constructor(
    @InjectRepository(HnTask)
    private readonly tasksRepository: Repository<HnTask>
  ) {
    this.tasksOfTheDay = TASKS_OF_THE_DAY
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value as HnTask);
  }

  async createTechnicalDocTasks(technicalFolder: HnTechnicalFolder, tasks: HnImportTaskDTO[]): Promise<boolean> {
    const oldTasks: HnTask[] = await this.tasksRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      }
    });

    for (const t of oldTasks) {
      await this.tasksRepository.delete(t.id);
    }

    for (const t of tasks) {
      const task = new HnTask();
      task.shortDescription = t.short_description ? t.short_description : null;
      task.doc = t.doc;
      task.brickName = technicalFolder.brickMajorVersion.brick.name;
      task.technicalFolder = technicalFolder;
      task.hide = t.hide;
      task.brickMajor = technicalFolder.brickMajorVersion.major;
      task.uniqueName = t.unique_name;
      task.typingName = t.typing_name;

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

  async findTasks(technicalFolder: HnTechnicalFolder): Promise<HnTask[]> {
    return this.tasksRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      },
      order: {
        humanName: 'ASC'
      }
    });
  }

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<HnGeneratedDocEntity> {

    const task: HnTask = await this.tasksRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id
      },
      uniqueName: uniqueName
    });
    if (task != null) {
      task.objectType = 'TASK';
    }

    return task;
  }


  //Get a task in the array tasksOfTheDay according to the day number
  async getTaskOfTheDay(): Promise<HnTask>{
    const dayNumber: number = Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000));
    let i: number = dayNumber % this.tasksOfTheDay.length;
    let task: HnTask = await this.findTaskOfTheDay(this.tasksOfTheDay[i].uniqueName, this.tasksOfTheDay[i].brickName);
    while (task == null){
      i = i + 1;
      task = await this.findTaskOfTheDay(this.tasksOfTheDay[i].uniqueName, this.tasksOfTheDay[i].brickName);
    }
    return task;
  }

  async findTaskOfTheDay(uniqueName: string, brickName: string): Promise<HnTask>{
    return this.tasksRepository.findOne({
      where:{
        uniqueName: uniqueName,
        brickName: brickName
      }
    });
  }

}
