import {Component, OnInit} from '@angular/core';
import {CaLabInstance, CaLabInstanceWithOrga} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  CaLabInstanceFormDialogComponent,
  CaLabInstanceFormDialogInput
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';
import {FlArrayObs, FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';

/**
 * List of lab instance in lab admin page, possibility to create and update the labs
 */
@Component({
  selector: 'ca-admin-lab-instances-list',
  templateUrl: './ca-admin-lab-instances-list.component.html',
  styleUrls: ['./ca-admin-lab-instances-list.component.scss']
})
export class CaAdminLabInstancesListComponent implements OnInit {

  labInstances: FlArrayObs<CaLabInstanceWithOrga>;

  displayedColumns: FlTableColumn<CaLabInstance>[] = ['organization', 'name', 'currentStatus',
    {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo', 'actions'];

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.getAllLabInstances();
  }

  private getAllLabInstances(): void {
    this.labInstances = this.labInstanceService.getAll();
  }

  openCreateLabInstanceForm(): void {
    const dialogInput: CaLabInstanceFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaLabInstanceFormDialogComponent, {data: dialogInput}).afterClosed()
      .subscribe(
        labInstance => this.onCreateLabInstanceClosed(labInstance)
      );
  }

  private onCreateLabInstanceClosed(labInstance?: CaLabInstanceWithOrga): void {
    if (labInstance) {
      this.labInstances.unshiftItem(labInstance);
    }
  }
}
