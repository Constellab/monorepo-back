import {Component, Input, OnInit} from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {LabTypeDialogComponent} from '../lab-type-dialog/lab-type-dialog.component';

/**
 * Icon button to load and show process type detail in a portal on clic
 */
@Component({
  selector: 'lab-type-show-detail-button',
  templateUrl: './lab-type-show-detail-button.component.html',
  styleUrls: ['./lab-type-show-detail-button.component.scss']
})
export class LabTypeShowDetailButtonComponent implements OnInit {

  @Input() typingName: string;

  constructor(private typeService: LabTypeService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }


  showDetail(): void {
    this.typeService.getTyping(this.typingName).subscribe(
      processType => this.openPortalDetail(processType)
    );
  }

  private openPortalDetail(processType: LabProcessType): void {
    this.dialogService.openMediumDialog(
      LabTypeDialogComponent, {data: processType});
  }
}
