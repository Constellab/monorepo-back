import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FlPortalActionsService, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabShareService} from '../../../../entity-service/lab-share.service';
import {MatDialogRef} from '@angular/material/dialog';
import {LabRouterService} from '../../../../service/lab-router.service';

/**
 * Import a resource from another lab with the share link
 */
@Component({
  selector: 'lab-import-resource-from-lab',
  templateUrl: './lab-import-resource-from-lab.component.html',
  styleUrls: ['./lab-import-resource-from-lab.component.scss']
})
export class LabImportResourceFromLabComponent implements OnInit {

  formCtrl: FormControl;

  constructor(private dialogRef: MatDialogRef<LabImportResourceFromLabComponent>,
              private shareService: LabShareService,
              private snackBarService: FlSnackBarService,
              private actionService: FlPortalActionsService) {
  }

  ngOnInit(): void {
    this.formCtrl = new FormControl(null, [Validators.required]);
  }

  submit(): void {
    if (this.formCtrl.valid) {
      this.importResource(this.formCtrl.value);
    }
  }

  private importResource(url: string): void {

    this.actionService.addAction({
      type: 'import-resource',
      action: this.shareService.importResourceFromLab(url),
      text: {text: 'biox.downloading_resource', translateText: true},
      successLink: (resource: LabResource) => LabRouterService.getResourceDetailRoute(resource.id),
    }, false);

    this.snackBarService.openSuccessMessage({text: 'biox.downloading_resource_help_text', translateText: true}, 5000);
    this.dialogRef.close();
  }
}
