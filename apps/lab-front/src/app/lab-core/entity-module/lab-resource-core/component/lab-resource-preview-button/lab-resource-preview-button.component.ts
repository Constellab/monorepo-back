import {Component, Input, OnInit} from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabResourceViewDetailDialogComponent,
  LabResourceViewDetailDialogInput
} from '../lab-resource-view-detail-dialog/lab-resource-view-detail-dialog.component';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Button to load and show the resource default view
 */
@Component({
  selector: 'lab-resource-preview-button',
  templateUrl: './lab-resource-preview-button.component.html',
  styleUrls: ['./lab-resource-preview-button.component.scss']
})
export class LabResourcePreviewButtonComponent implements OnInit {

  @Input() resourceId: string;

  @Input() resourceName: string;

  @Input() stopPropagation: boolean = false;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openResourcePreview(event: MouseEvent): void {
    if (this.stopPropagation) {
      ClHelpService.stopEventPropagation(event);
    }
    const data: LabResourceViewDetailDialogInput = {
      resourceId: this.resourceId,
      resourceName: this.resourceName
    };
    this.dialogService.openBigDialog(LabResourceViewDetailDialogComponent, {data: data});
  }
}
