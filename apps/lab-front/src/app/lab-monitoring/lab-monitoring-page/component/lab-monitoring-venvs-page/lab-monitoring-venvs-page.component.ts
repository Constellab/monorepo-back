import {Component, OnInit} from '@angular/core';
import {LabVenvService} from '../../../../lab-core/entity-service/lab-venv.service';
import {Observable, share} from 'rxjs';
import {LabVenvArrayObs, LabVEnvsStatus} from '../../../../lab-core/model/entities/lab-venv.entity';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {map} from 'rxjs/operators';

/**
 * Sub-page of monitoring to list all venvs
 * Check the detail of a venv and delete it
 */
@Component({
  selector: 'lab-monitoring-venvs-page',
  templateUrl: './lab-monitoring-venvs-page.component.html',
  styleUrls: ['./lab-monitoring-venvs-page.component.scss']
})
export class LabMonitoringVenvsPageComponent implements OnInit {

  venvsStatus$: Observable<LabVEnvsStatus>;

  venvsList: LabVenvArrayObs;

  displayedColumns: string[] = ['name', 'type', 'configFileOrigin', 'createdAt', 'actions'];

  constructor(private venvService: LabVenvService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.venvsStatus$ = this.venvService.getVenvsStatus().pipe(share());
    this.venvsList = new LabVenvArrayObs(this.venvsStatus$.pipe(map(status => status.envs)));
  }

  openDeleteAllEnvsDialog(): void {
    const data: FlConfirmDialogInput = {
      title: 'monitoring.delete_all_venvs',
      content: 'monitoring.delete_all_venvs_confirmation',
      translateTitleAndContent: true,
      observable: this.venvService.deleteAllVenvs(),
      successMessage: 'monitoring.delete_all_venvs_success',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteAllEnvsClosed(result)
    );
  }

  private onDeleteAllEnvsClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.venvsList.clearArray();
    }
  }

}
