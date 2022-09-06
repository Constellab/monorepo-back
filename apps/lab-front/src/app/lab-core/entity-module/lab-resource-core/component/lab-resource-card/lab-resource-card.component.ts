import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabResourceDetailDialogComponent} from '../lab-resource-detail-dialog/lab-resource-detail-dialog.component';

@Component({
  selector: 'lab-resource-card',
  templateUrl: './lab-resource-card.component.html',
  styleUrls: ['./lab-resource-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceCardComponent implements OnInit {

  @Input() resource: LabResource;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openResourceDetail(): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent, {
      data: this.resource.id,
      panelClass: 'g-dialog-main-background'
    });
  }

}
