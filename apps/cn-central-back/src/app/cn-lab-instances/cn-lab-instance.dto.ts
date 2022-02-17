import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {BlBaseEntityDto} from '@monorepo/back-core-lib';


export class CnLabInstanceDto extends BlBaseEntityDto {
  name: string = undefined;
  lab: CnLabConfig = undefined;
  owner: CnUser = undefined;
  currentStatus: CnLabInstanceStatusHistory = undefined;
  virtualHost: string = undefined;
  apiUrl: string = undefined;
  glabApiKey: string = undefined;
  labManagerApiKey: string = undefined;
  codelabToken: string = undefined;
  frontUrl: string = undefined;
  serverInfo: CnServerInfo = undefined;
}


