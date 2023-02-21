import {Component, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstance, CaLabInstanceDatasource} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';
import {CaDashboardListLayoutComponent} from '../ca-dashboard-list-layout/ca-dashboard-list-layout.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceFormDialogComponent,
  CaLabInstanceFormDialogInput
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';

/**
 * Small list of lab instances in the dashboard
 */
@Component({
  selector: 'ca-dashboard-lab-instances',
  templateUrl: './ca-dashboard-lab-instances.component.html',
  styleUrls: ['./ca-dashboard-lab-instances.component.scss']
})
export class CaDashboardLabInstancesComponent implements OnInit {

  labInstancesDatasource: CaLabInstanceDatasource;

  myLabInstancesRoute: string = CaRouterService.getMyLabInstancesRoute();

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.getMyLabInstances();
  }

  private getMyLabInstances(): void {
    this.labInstancesDatasource = this.labInstanceService.getCurrentLabInstancesDatasource(CaDashboardListLayoutComponent.maxItems);
  }

  openCreateLabInstanceDialog(): void {
    const input: CaLabInstanceFormDialogInput = {
      mode: 'create'
    };
    this.dialogService.openSmallDialog(CaLabInstanceFormDialogComponent, {data: input}).afterClosed().subscribe(
      labInstance => this.onCreateLabInstanceDialogClosed(labInstance)
    );
  }

  private onCreateLabInstanceDialogClosed(labInstance?: CaLabInstance): void {
    // only navigate if the lab instance has been created (for cloud lab, it sends a request, do nothing here)
    if (labInstance && labInstance instanceof CaLabInstance) {
      this.routerService.navigateToLabInstanceDetail(labInstance.id);
    }
  }

}
