import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {LabBrickEntity} from '../../../../lab-core/model/entities/lab-brick.entity';
import {LabBrickService} from '../../../../lab-core/entity-service/lab-brick.service';
import {FlDialogService, FlFileHelper} from '@monorepo/front-core-lib';
import {
  LabBrickCallMigrationDialogComponent
} from '../lab-brick-call-migration-dialog/lab-brick-call-migration-dialog.component';
import {LabTypeService} from '../../../../lab-core/entity-service/lab-type.service';

/**
 * Show information and messages about a brick
 */
@Component({
  selector: 'lab-brick-info',
  templateUrl: './lab-brick-info.component.html',
  styleUrls: ['./lab-brick-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabBrickInfoComponent implements OnInit {

  @Input() brick: LabBrickEntity;

  generateDocIsLoading: boolean = false;

  constructor(private labBrickService: LabBrickService,
              private cdr: ChangeDetectorRef,
              private dialogService: FlDialogService,
              private typeService: LabTypeService) {
  }

  ngOnInit(): void {
  }

  generateTechnicalDoc(): void {
    this.generateDocIsLoading = true;
    this.labBrickService.generateTechnicalDoc(this.brick.name).subscribe({
      next: doc => this.onSuccess(doc),
      error: () => this.onComplete(),
    });
  }

  openCallMigrationDialog(): void {
    this.dialogService.openMediumDialog(LabBrickCallMigrationDialogComponent,
      {data: this.brick.name});
  }

  private onSuccess(doc: any): void {
    FlFileHelper.downloadJsonFile(doc, `${this.brick.name}-doc.json`);
    this.onComplete();
  }

  private onComplete(): void {
    this.generateDocIsLoading = false;
    this.cdr.markForCheck();
  }

  deleteUnavailableTypings(): void {
    this.dialogService.openConfirmDialog({
      title: 'monitoring.delete_unavailable_typings',
      content: 'monitoring.delete_unavailable_typings_confirmation',
      translateTitleAndContent: true,
      observable: this.typeService.deleteUnavailableTypings(this.brick.name),
      successMessage: 'monitoring.delete_unavailable_typings_success',
      translateMessage: true
    });
  }

}
