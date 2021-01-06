import {Component, OnInit} from '@angular/core';
import {ArrayObs} from '../../../core/model/datasource/array-obs.class';
import {Lab} from '../../../core/model/entities/lab.class';
import {LabService} from '../../../dashboard/service/lab.service';
import {TableColumn} from '../../../core/abstract-directive/table-abstract.directive';
import {FormDialogInput} from '../../../core/model/global/form.class';
import {DialogService} from '../../../core/service/dialog.service';
import {LabFormDialogComponent} from '../../../core/entity-module/lab-core/component/lab-form-dialog/lab-form-dialog.component';

@Component({
  selector: 'gen-my-labs-page',
  templateUrl: './my-labs-page.component.html',
  styleUrls: ['./my-labs-page.component.scss']
})
export class MyLabsPageComponent implements OnInit {

  labsArrays: ArrayObs<Lab>;

  columns: TableColumn<Lab>[] = ['label', 'createdAt', 'lastModifiedAt', 'actions'];

  constructor(private labService: LabService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.labsArrays = this.labService.getCurrentLabs();
  }

  openCreateLabDialog(): void {
    const dialogInput: FormDialogInput<Lab> = {
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
