import {Component, OnInit} from '@angular/core';
import {LabInstance} from '../../../core/model/entities/lab-instance.class';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {ArrayObs} from '../../../core/model/datasource/array-obs.class';
import {TableColumn} from '../../../core/abstract-directive/table-abstract.directive';
import {FormDialogInput} from '../../../core/model/global/form.class';
import {DialogService} from '../../../core/service/dialog.service';
import {LabInstanceFormDialogComponent} from '../../../core/entity-module/lab-core/component/lab-instance-form-dialog/lab-instance-form-dialog.component';

/**
 * List of lab instance in lab admin page, possibility to create and update the labs
 */
@Component({
  selector: 'gen-admin-lab-instances-list',
  templateUrl: './admin-lab-instances-list.component.html',
  styleUrls: ['./admin-lab-instances-list.component.scss']
})
export class AdminLabInstancesListComponent implements OnInit {

  labInstances: ArrayObs<LabInstance>;

  displayedColumns: TableColumn<LabInstance>[] = ['lab', 'owner', 'currentStatus', 'ip', 'ipv6', 'url',
    'serverInfo', 'actions'];

  constructor(private labInstanceService: LabInstanceService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.getAllLabInstances();
  }

  private getAllLabInstances(): void {
    this.labInstances = this.labInstanceService.getAll();
  }

  openCreateLabInstanceForm(): void {
    const dialogInput: FormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(LabInstanceFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      labInstance => this.onCreateLabInstanceClosed(labInstance)
    );
  }

  private onCreateLabInstanceClosed(labInstance?: LabInstance): void {
    if (labInstance) {
      this.labInstances.unshiftItem(labInstance);
    }
  }
}
