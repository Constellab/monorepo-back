import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnTask} from './hn-task.entity';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportTaskDTO} from '../brick/hn-brick.dto';
import {HnResource} from '../resource/hn-resource.entity';

@Injectable()
export class HnTaskService {
  constructor(
    @InjectRepository(HnTask)
    private readonly tasksRepository: Repository<HnTask>
  ) {
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

      if(t.additional_info && Object.keys(t.additional_info).length > 0){
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

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<any> {

    const task: HnTask = await this.tasksRepository.findOne({
      technicalFolder: {
        id: tecFolder.id
      },
      uniqueName: uniqueName
    });


    if (task) {
      const doc: any = {
        brickName: task.brickName,
        uniqueName: task.uniqueName,
        humanName: task.humanName,
        shortDescription: task.shortDescription,
        doc: task.doc,
        parentTypingName: task.parentTypingName,
        parentMajorVersion: task.parentMajorVersion,
        parentHumanName: task.parentHumanName,
        parentVersion: task.parentVersion,
        objectType: 'TASK',
        inputSpecs: task.inputSpecs,
        outputSpecs: task.outputSpecs,
        configSpecs: task.configSpecs,
        additionalInfo: task.additionalInfo,
        objectSubType: task.objectSubType
      };

      return doc;
    }

    return null;


  }
}
