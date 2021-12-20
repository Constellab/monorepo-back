import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FlArrayObs, FlDialogService, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';
import {CaLabInstanceUser} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {
  CaLabInstanceUserFormDialogComponent,
  LabInstanceUserFormDialogInput
} from '../ca-lab-instance-user-form-dialog/ca-lab-instance-user-form-dialog.component';

@Component({
  selector: 'ca-lab-instance-users-list',
  templateUrl: './ca-lab-instance-users-list.component.html',
  styleUrls: ['./ca-lab-instance-users-list.component.scss']
})
export class CaLabInstanceUsersListComponent implements OnInit {

  @Input() labInstanceId: string;

  column: FlTableColumn<CaLabInstanceUser>[] = ['fullname', 'group', 'isActive'];

  datasource: FlArrayObs<CaLabInstanceUser>;

  constructor(private labInstanceService: CaLabInstanceService,
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

    this.dialogService.openSmallDialog(CaLabInstanceUserFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onUserAddedClosed(result)
    );
  }

  private onUserAddedClosed(user?: CaLabInstanceUser): void {
    if (user) {
      this.datasource.addItem(user);
    }
  }

}
