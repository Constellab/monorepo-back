import {CnUser} from '../cn-users/cn-user.entity';
import {CnLab} from '../cn-labs/cn-lab.entity';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {BlBaseEntityDto} from '@monorepo/back-core-lib';


export class CnLabInstanceDto extends BlBaseEntityDto {
  name: string = undefined;
  lab: CnLab = undefined;
  owner: CnUser = undefined;
  currentStatus: CnLabInstanceStatusHistory = undefined;
  apiUrl: string = undefined;
  apiKey: string = undefined;
  frontUrl: string = undefined;
  serverInfo: CnServerInfo = undefined;
}


