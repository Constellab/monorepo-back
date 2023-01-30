import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {LabBrickData, LabBrickDataArrayObs} from '../../../../model/global/lab-brick-data.class';
import {LabBrickDataService} from '../../../../service/lab-brick-data.service';

@Component({
  selector: 'lab-brick-data-table',
  templateUrl: './lab-brick-data-table.component.html',
  styleUrls: ['./lab-brick-data-table.component.scss']
})
export class LabBrickDataTableComponent extends FlTableAbstractDirective<LabBrickData>
  implements OnInit {

  @Input() datasource: LabBrickDataArrayObs;

  constructor(private brickDataService: LabBrickDataService,
              private dialogService: FlDialogService) {
    super(['fsNodeName', 'fsNodeSize', 'fsNodeType', 'brickName', 'actions']);
  }

  ngOnInit(): void {
  }

  openDeleteBrickData(brickData: LabBrickData): void {
    const data: FlConfirmDialogInput = {
      title: 'monitoring.delete_brick_data',
      content: 'monitoring.delete_brick_data_confirmation',
      translateTitleAndContent: true,
      observable: this.brickDataService.deleteBrickData(brickData.fsNodePath),
      successMessage: 'monitoring.brick_data_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result, brickData)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, brickData: LabBrickData): void {
    if (result.choice) {
      this.datasource.removeItem(brickData);
    }
  }

}
