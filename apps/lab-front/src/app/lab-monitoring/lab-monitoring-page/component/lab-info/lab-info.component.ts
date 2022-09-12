import {Component, OnInit} from '@angular/core';
import {LabSystemService} from '../../../../lab-core/service/lab-system.service';
import {LabSystemInfo} from '../../../../lab-core/model/global/lab-system.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabTypeService} from '../../../../lab-core/entity-service/lab-type.service';

@Component({
  selector: 'lab-info',
  templateUrl: './lab-info.component.html',
  styleUrls: ['./lab-info.component.scss']
})
export class LabInfoComponent implements OnInit {

  labInfo: LabSystemInfo;
  isLoading: boolean = true;

  constructor(private systemService: LabSystemService,
              private typeService: LabTypeService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.systemService.getSystemInfo().subscribe(
      {
        next: labInfo => this.onSuccess(labInfo),
        error: () => this.onError()
      }
    );
  }

  private onSuccess(labInfo: LabSystemInfo): void {
    this.labInfo = labInfo;
    this.isLoading = false;
  }

  private onError(): void {
    this.labInfo = null;
    this.isLoading = false;
  }

  deleteUnavailableTypings(): void {
    this.dialogService.openConfirmDialog({
      title: 'monitoring.delete_all_unavailable_typings',
      content: 'monitoring.delete_unavailable_typings_confirmation',
      translateTitleAndContent: true,
      observable: this.typeService.deleteUnavailableTypings(),
      successMessage: 'monitoring.delete_unavailable_typings_success',
      translateMessage: true
    });
  }
}
