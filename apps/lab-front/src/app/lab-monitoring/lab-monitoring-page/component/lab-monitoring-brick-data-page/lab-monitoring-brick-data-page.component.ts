import {Component, OnInit} from '@angular/core';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {LabBrickDataService} from '../../../../lab-core/service/lab-brick-data.service';
import {LabBrickDataArrayObs} from '../../../../lab-core/model/global/lab-brick-data.class';

@Component({
  selector: 'lab-monitoring-brick-data-page',
  templateUrl: './lab-monitoring-brick-data-page.component.html',
  styleUrls: ['./lab-monitoring-brick-data-page.component.scss']
})
export class LabMonitoringBrickDataPageComponent implements OnInit {

  brickDataList: LabBrickDataArrayObs;

  displayedColumns: string[] = ['fsNodeName',  'brickName',  'fsNodeSize', 'fsNodeType', 'actions'];


  constructor(private brickDataService: LabBrickDataService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.brickDataList = new LabBrickDataArrayObs(this.brickDataService.getBrickData());
  }

  openDeleteAllBrickData(): void {
    const data: FlConfirmDialogInput = {
      title: 'monitoring.delete_all_brick_data',
      content: 'monitoring.delete_all_brick_data_confirmation',
      translateTitleAndContent: true,
      observable: this.brickDataService.deleteAllBrickData(),
      successMessage: 'monitoring.all_brick_data_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.brickDataList.clearArray();
    }
  }

}
