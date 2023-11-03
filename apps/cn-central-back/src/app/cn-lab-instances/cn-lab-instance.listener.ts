import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {CnProjectEvent, cnProjectEventName} from '../cn-projects-aggregate/cn-project.event';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';


@Injectable()
export class CnLabInstanceListener {

  constructor(private labProjectService: CnLabInstanceProjectService) {
  }

  @OnEvent(cnProjectEventName)
  async handleCnProjectEvent(event: CnProjectEvent): Promise<void> {
    console.log('CnLabInstanceListener.handleCnProjectEvent', event);


  }

  private async handleCreateProject(project: CnProject): Promise<void> {
  }
}
