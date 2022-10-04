import {Component, OnInit} from '@angular/core';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';
import {CaUserProfileEditDialogComponent} from '../ca-user-profile-edit-dialog/ca-user-profile-edit-dialog.component';

@Component({
  selector: 'ca-user-profile-section',
  templateUrl: './ca-user-profile-section.component.html',
  styleUrls: ['./ca-user-profile-section.component.scss']
})
export class CaUserProfileSectionComponent implements OnInit {

  user: CaUser;

  constructor(
    private authenticatedUserService: CaAuthenticatedUserService,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.user = this.authenticatedUserService.getUser();
  }

  openEditProfileDialog(): void {
    const input: FlFormDialogInput<Partial<CaUser>> = {
      mode: 'update',
      object: this.user
    };
    this.dialogService.openMediumDialog(CaUserProfileEditDialogComponent, {data: input}).afterClosed().subscribe(
      (res) => {
        if(res){
          window.location.reload();
        }

      }
    );
  }

}
