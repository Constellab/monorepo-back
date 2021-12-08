import {Component, Inject, OnInit} from '@angular/core';
import {BioxProcessType} from '../../../../model/entities/lab-type/biox-process-type.entity';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-process-type-portal',
  templateUrl: './biox-process-type-portal.component.html',
  styleUrls: ['./biox-process-type-portal.component.scss']
})
export class BioxProcessTypePortalComponent implements OnInit {

  processType: BioxProcessType;

  constructor(@Inject(FL_PORTAL_DATA) processType: BioxProcessType) {
    this.processType = processType;
  }

  ngOnInit(): void {
  }

}
