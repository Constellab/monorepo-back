import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabTechnicalInfo} from '../../../../model/entities/resource/lab-technical-info.class';
import {LabTechnicalInfoDialogComponent} from '../lab-technical-info-dialog/lab-technical-info-dialog.component';

/**
 * Button to open the technical information dialog
 */
@Component({
  selector: 'lab-technical-info-button',
  templateUrl: './lab-technical-info-button.component.html',
  styleUrls: ['./lab-technical-info-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabTechnicalInfoButtonComponent implements OnInit {

  @Input() technicalInfo: LabTechnicalInfo[];

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  hasTechnicalInfo(): boolean {
    return this.technicalInfo?.length > 0;
  }

  openDialog(): void {
    this.dialogService.openMediumDialog(LabTechnicalInfoDialogComponent, {data: this.technicalInfo});
  }

}
