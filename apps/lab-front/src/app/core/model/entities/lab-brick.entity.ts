import {LabEntity} from '../global/lab-entity.entity';
import {FlStatus, FlStatusColorMode, FlStatusHelper} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export type LabBrickMessageStatus = 'INFO' | 'ERROR' | 'WARNING'

export class LabBrickMessage implements FlStatus {
  message: string;
  status: LabBrickMessageStatus;

  getStatusName(): string {
    switch (this.status) {
      case 'INFO':
        return 'monitoring.lab_status_info';
      case 'ERROR':
        return 'monitoring.lab_status_error';
      case 'WARNING':
        return 'monitoring.lab_status_warning';
    }
  }

  getStatusClassColor(mode: FlStatusColorMode): string {
    switch (this.status) {
      case 'INFO':
        return FlStatusHelper.getInfoColor(mode);
      case 'ERROR':
        return FlStatusHelper.getErrorColor(mode);
      case 'WARNING':
        return FlStatusHelper.getWarningColor(mode);
    }
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'INFO':
        return FlStatusHelper.infoIcon;
      case 'ERROR':
        return FlStatusHelper.errorIcon;
      case 'WARNING':
        return FlStatusHelper.warningIcon;
    }
  }


}

class LabBrickData extends LabEntity {

  @Type(() => LabBrickMessage)
  messages: LabBrickMessage[];

}

export type LabBrickStatus = 'SUCCESS' | 'ERROR' | 'WARNING'

export class LabBrickEntity extends LabEntity implements FlStatus {
  name: string;
  status: LabBrickStatus;

  @Type(() => LabBrickData)
  data: LabBrickData;

  hasMessages(): boolean {
    return this.countMessages() > 0;
  }

  countMessages(): number{
    return this.data?.messages.length ?? 0
  }

  getStatusClassColor(mode: FlStatusColorMode): string {
    switch (this.status) {
      case 'SUCCESS':
        return FlStatusHelper.getSuccessColor(mode);
      case 'ERROR':
        return FlStatusHelper.getErrorColor(mode);
      case 'WARNING':
        return FlStatusHelper.getWarningColor(mode);
    }
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'SUCCESS':
        return FlStatusHelper.successIcon;
      case 'ERROR':
        return FlStatusHelper.errorIcon;
      case 'WARNING':
        return FlStatusHelper.warningIcon;
    }
  }

  getStatusName(): string {
    switch (this.status) {
      case 'SUCCESS':
        return 'monitoring.lab_status_success';
      case 'ERROR':
        return 'monitoring.lab_status_error';
      case 'WARNING':
        return 'monitoring.lab_status_warning';
    }
  }


}
