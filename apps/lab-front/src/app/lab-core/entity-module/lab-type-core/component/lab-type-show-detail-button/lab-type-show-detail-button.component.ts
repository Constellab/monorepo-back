import {Component, Input, OnInit} from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabTypeDialogComponent, LabTypeDialogInput} from '../lab-type-dialog/lab-type-dialog.component';

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

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }


  showDetail(): void {
    const data: LabTypeDialogInput = {
      typingName: this.typingName,
    };
    this.dialogService.openMediumDialog(
      LabTypeDialogComponent, {data: data});
  }
}
