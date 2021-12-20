import {Component, Inject, OnInit} from '@angular/core';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-process-type-portal',
  templateUrl: './lab-process-type-portal.component.html',
  styleUrls: ['./lab-process-type-portal.component.scss']
})
export class LabProcessTypePortalComponent implements OnInit {

  processType: LabProcessType;

  constructor(@Inject(FL_PORTAL_DATA) processType: LabProcessType) {
    this.processType = processType;
  }

  ngOnInit(): void {
  }

}
