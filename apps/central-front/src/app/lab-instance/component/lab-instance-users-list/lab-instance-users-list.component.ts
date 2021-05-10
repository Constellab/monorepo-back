import {Component, Input, OnInit} from '@angular/core';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {FlArrayObs, FlDialogService, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';
import {LabInstanceUser} from '../../../core/model/entities/lab-instance.class';
import {
  LabInstanceUserFormDialogComponent,
  LabInstanceUserFormDialogInput
} from '../lab-instance-user-form-dialog/lab-instance-user-form-dialog.component';

@Component({
  selector: 'gen-lab-instance-users-list',
  templateUrl: './lab-instance-users-list.component.html',
  styleUrls: ['./lab-instance-users-list.component.scss']
})
export class LabInstanceUsersListComponent implements OnInit {

  @Input() labInstanceId: string;

  column: FlTableColumn<LabInstanceUser>[] = ['fullname', 'group', 'isActive'];

  datasource: FlArrayObs<LabInstanceUser>;

  constructor(private labInstanceService: LabInstanceService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.datasource = new FlEntityArrayObs(this.labInstanceService.getLabInstanceUsers(this.labInstanceId));
  }

  openAddUserDialog(): void {
    const input: LabInstanceUserFormDialogInput = {
      labInstanceId: this.labInstanceId,
      mode: 'create'
    };

    this.dialogService.openSmallDialog(LabInstanceUserFormDialogComponent, {data: input})
      .afterClosed().subscribe(
      result => this.onUserAddedClosed(result)
    );
  }

  private onUserAddedClosed(user?: LabInstanceUser): void {
    if (user) {
      this.datasource.addItem(user);
    }
  }

}
