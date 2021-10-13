import {User} from '../users/user.entity';
import {Lab} from '../labs/lab.entity';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {ServerInfo} from '../servers-info/server-info.entity';
import {BlBaseEntityDto} from '@monorepo/back-core-lib';


export class LabInstanceDto extends BlBaseEntityDto {
  name: string = undefined;
  lab: Lab = undefined;
  owner: User = undefined;
  currentStatus: LabInstanceStatusHistory = undefined;
  apiUrl: string = undefined;
  apiKey: string = undefined;
  frontUrl: string = undefined;
  serverInfo: ServerInfo = undefined;
}


