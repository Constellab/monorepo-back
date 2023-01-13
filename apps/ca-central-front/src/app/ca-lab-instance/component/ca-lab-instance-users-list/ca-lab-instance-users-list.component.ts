import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaLabInstanceUserFormDialogComponent,
  LabInstanceUserFormDialogInput
} from '../ca-lab-instance-user-form-dialog/ca-lab-instance-user-form-dialog.component';
import {
  CaLabInstanceUser,
  CaLabInstanceUserDatasource
} from '../../../ca-core/model/entities/lab/ca-lab-instance-user.class';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ca-lab-instance-users-list',
  templateUrl: './ca-lab-instance-users-list.component.html',
  styleUrls: ['./ca-lab-instance-users-list.component.scss']
})
export class CaLabInstanceUsersListComponent implements OnInit {

  @Input() labInstanceId: string;

  columns$: Observable<FlTableColumn<CaLabInstanceUser>[]> = this.state.isLabOwner$().pipe(
    map(isLabOwner => {
      const columns = ['user', 'role', 'createdBy', 'createdAt'];
      // set the action column only if the user is the lab owner
      if (isLabOwner) {
        columns.push('actions');
      }
      return columns;
    }));

  datasource: CaLabInstanceUserDatasource;

  isOwner$: Observable<boolean> = this.state.isLabOwner$();

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService,
              private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
    this.datasource = new CaLabInstanceUserDatasource(
      this.labInstanceService.getLabInstanceUsers(this.labInstanceId)
    );
  }

  openAddUserDialog(): void {
    const input: LabInstanceUserFormDialogInput = {
      labInstanceId: this.labInstanceId,
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaLabInstanceUserFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onUserAddedClosed(result)
    );
  }

  private onUserAddedClosed(labUser?: CaLabInstanceUser): void {
    if (labUser) {
      this.datasource.addItem(labUser);
    }
  }

}
