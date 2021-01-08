import {Component, OnInit} from '@angular/core';
import {Lab} from '../../../core/model/entities/lab.class';
import {LabService} from '../../../dashboard/service/lab.service';
import {LabFormDialogComponent} from '../../../core/entity-module/lab-core/component/lab-form-dialog/lab-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-my-labs-page',
  templateUrl: './my-labs-page.component.html',
  styleUrls: ['./my-labs-page.component.scss']
})
export class MyLabsPageComponent implements OnInit {

  labsArrays: FlArrayObs<Lab>;

  columns: FlTableColumn<Lab>[] = ['label', 'createdAt', 'lastModifiedAt', 'actions'];

  constructor(private labService: LabService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.labsArrays = this.labService.getCurrentLabs();
  }

  openCreateLabDialog(): void {
    const dialogInput: FlFormDialogInput<Lab> = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(LabFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onCreateDialogClosed(result)
    );
  }

  private onCreateDialogClosed(lab?: Lab): void {
    if (lab) {
      this.labsArrays.unshiftItem(lab);
    }
  }

}
