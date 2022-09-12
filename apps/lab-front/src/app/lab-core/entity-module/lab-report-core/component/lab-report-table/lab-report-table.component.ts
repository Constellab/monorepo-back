import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabReport} from '../../../../model/entities/lab-report.entity';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'lab-report-table',
  templateUrl: './lab-report-table.component.html',
  styleUrls: ['./lab-report-table.component.scss']
})
export class LabReportTableComponent extends FlTableAbstractDirective<LabReport>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() reportSelected: EventEmitter<LabReport> = new EventEmitter();

  @Output() reportDisassociate: EventEmitter<LabReport> = new EventEmitter();

  constructor() {
    super(['title', 'isValidated', 'createdAt', 'disassociate']);
  }

  ngOnInit(): void {
  }

  rowClicked(report: LabReport): void {
    if (this.rowSelectable) {
      this.reportSelected.next(report);
    }
  }

  disassociateReport(report: LabReport, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.reportDisassociate.next(report);
  }
}
