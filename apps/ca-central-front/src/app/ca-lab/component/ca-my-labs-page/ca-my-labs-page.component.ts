import {Component, OnInit} from '@angular/core';
import {CaLab} from '../../../ca-core/model/entities/ca-lab.class';
import {CaLabService} from '../../../ca-core/service-api/ca-lab.service';
import {
  CaLabFormDialogComponent
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-form-dialog/ca-lab-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-my-labs-page',
  templateUrl: './ca-my-labs-page.component.html',
  styleUrls: ['./ca-my-labs-page.component.scss']
})
export class CaMyLabsPageComponent implements OnInit {

  labsArrays: FlArrayObs<CaLab>;

  columns: FlTableColumn<CaLab>[] = ['label', 'createdAt', 'lastModifiedAt', 'actions'];

  constructor(private labService: CaLabService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.labsArrays = this.labService.getCurrentLabs();
  }

  openCreateLabDialog(): void {
    const dialogInput: FlFormDialogInput<CaLab> = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaLabFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onCreateDialogClosed(result)
    );
  }

  private onCreateDialogClosed(lab?: CaLab): void {
    if (lab) {
      this.labsArrays.unshiftItem(lab);
    }
  }

}
