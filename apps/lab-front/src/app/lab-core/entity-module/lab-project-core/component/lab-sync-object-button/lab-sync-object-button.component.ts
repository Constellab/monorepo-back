import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabProjectObject} from '../../../../model/entities/lab-project.class';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

/**
 * Component containing the button to sync a lab project object with central
 */
@Component({
  selector: 'lab-sync-object-button',
  templateUrl: './lab-sync-object-button.component.html',
  styleUrls: ['./lab-sync-object-button.component.scss']
})
export class LabSyncObjectButtonComponent<T extends LabProjectObject> implements OnInit {

  @Input() object: T;

  @Input() syncObjectFunc: (id: string) => Observable<T>;

  @Output() objectUpdate: EventEmitter<T> = new EventEmitter();

  isLoading: boolean = false;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  syncClick(): void {
    if (this.isLoading) return;
    // if this is the first sync, show the info dialog
    if (!this.object.isSynced) {
      this.openSyncConfirmDialog();
    } else {
      this.syncObject();
    }
  }

  private openSyncConfirmDialog(): void {
    const data: FlConfirmDialogInput = {
      title: 'biox.sync_with_central',
      content: 'biox.sync_object_confirmation',
      translateTitleAndContent: true,
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      (result: FlConfirmDialogResult) => {
        if (result.choice) {
          this.syncObject();
        }
      }
    );
  }


  private syncObject(): void {
    this.isLoading = true;

    this.syncObjectFunc(this.object.id).subscribe({
      next: (object: T) => this.onSyncSuccess(object),
      error: () => this.isLoading = false
    });
  }

  private onSyncSuccess(object: T): void {
    this.isLoading = false;
    this.objectUpdate.emit(object);
  }

}
