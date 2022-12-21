import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {Observable} from 'rxjs';
import {LabSharedEntity} from '../../../../model/entities/lab-share.entity';

/**
 * Component to show the origin of a shared resource.
 */
@Component({
  selector: 'lab-shared-entity-origin-dialog',
  templateUrl: './lab-shared-entity-origin-dialog.component.html',
  styleUrls: ['./lab-shared-entity-origin-dialog.component.scss']
})
export class LabSharedEntityOriginDialogComponent implements OnInit {

  resourceShare$: Observable<LabSharedEntity> = this.resourceService.getSharedResourceOrigin(this.resourceId);

  constructor(@Inject(MAT_DIALOG_DATA) private resourceId: string,
              private resourceService: LabResourceService) {
  }

  ngOnInit(): void {
  }

}
