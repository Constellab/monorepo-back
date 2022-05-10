import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaGroup, CaSaveTeamDTO} from '../../../../model/entities/ca-group.entity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CaGroupService} from '../../../../service-api/ca-group.service';

@Component({
  selector: 'ca-team-form-dialog',
  templateUrl: './ca-team-form-dialog.component.html',
  styleUrls: ['./ca-team-form-dialog.component.scss']
})
export class CaTeamFormDialogComponent extends FlFormDialogAbstractDirective<CaSaveTeamDTO, CaGroup>
  implements OnInit {

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaTeamFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaSaveTeamDTO>,
              private groupService: CaGroupService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_team' : 'update_team';
  }


  buildForm(): FormGroup<CaSaveTeamDTO> {
    return new FormBuilder().group({
      id: [null],
      label: [null, [Validators.required]],
    });
  }

  create(formValue: CaSaveTeamDTO): Observable<CaGroup> {
    return this.groupService.createTeam(formValue.label);
  }

  update(formValue: CaSaveTeamDTO): Observable<CaGroup> {
    return this.groupService.updateTeamLabel(formValue.id, formValue.label);
  }

  getCreateSuccessMessage(): string {
    return 'team_created';
  }

  getUpdateSuccessMessage(): string {
    return 'team_updated';
  }

}
