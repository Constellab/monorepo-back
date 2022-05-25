import {Component, Input, OnInit} from '@angular/core';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {TdProtocolType, TdResourceType, TdTaskType} from '@monorepo/technical-doc';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Component to show the detail of a type (resource, task or protocol)
 */
@Component({
  selector: 'lab-type-detail',
  templateUrl: './lab-type-detail.component.html',
  styleUrls: ['./lab-type-detail.component.scss'],
})
export class LabTypeDetailComponent implements OnInit {

  @Input() set type(type: LabTypeEntity) {
    this.tdType = this.convertLabTypeToTdType(type);
  }

  tdType: TdResourceType | TdTaskType | TdProtocolType;

  constructor() {
  }

  ngOnInit(): void {
  }

  private convertLabTypeToTdType(type: LabTypeEntity): TdResourceType | TdTaskType | TdProtocolType {
    if (type == null) return null;

    if (type instanceof LabProcessType) {
      return this.convertLabProcessToTdProcess(type);
    } else {
      return type;
    }
  }

  private convertLabProcessToTdProcess(process: LabProcessType): TdTaskType | TdProtocolType {
    // todo to improve
    const type: TdTaskType | TdProtocolType = Object.assign({}, process) as any;
    type.configSpecs = ClHelpService.deepClone(process.configSpecs.record) as any;
    return type;
  }
}
