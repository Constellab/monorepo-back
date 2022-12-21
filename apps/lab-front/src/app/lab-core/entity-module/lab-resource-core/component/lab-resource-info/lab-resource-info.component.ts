import {Component, Input, OnInit} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {
  LabTypeDialogComponent,
  LabTypeDialogInput
} from '../../../lab-type-core/component/lab-type-dialog/lab-type-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabSharedEntityOriginDialogComponent
} from '../../../lab-share-core/component/lab-shared-entity-origin-dialog/lab-shared-entity-origin-dialog.component';

/**
 * Component to show info about a resource
 */
@Component({
  selector: 'lab-resource-info',
  templateUrl: './lab-resource-info.component.html',
  styleUrls: ['./lab-resource-info.component.scss']
})
export class LabResourceInfoComponent implements OnInit {

  @Input() resource: LabResource;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openTypingDoc(): void {
    const data: LabTypeDialogInput = {
      typingName: this.resource.resourceTypingName
    };
    this.dialogService.openMediumDialog(LabTypeDialogComponent, {data: data});
  }

  openResourceShareOrigin(): void {
    if (this.resource.origin === 'IMPORTED_FROM_LAB') {
      this.dialogService.openMediumDialog(LabSharedEntityOriginDialogComponent, {data: this.resource.id});
    }
  }
}
