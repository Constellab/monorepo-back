import {Component, Inject, OnInit} from '@angular/core';
import {FlTag} from '../../fl-tag.class';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';

export type FlTagUpdateMethod = (tags: FlTag[]) => Observable<FlTag[]>;

export interface FlTagFormDialogInput {
  updateMethod: FlTagUpdateMethod; // method to update the tags
  title?: string; // default to update tag
  tags: FlTag[]; // list of current tags
}

/**
 * Form dialog to update the tags and save them
 */
@Component({
  selector: 'fl-tag-form-dialog',
  templateUrl: './fl-tag-form-dialog.component.html',
  styleUrls: ['./fl-tag-form-dialog.component.scss']
})
export class FlTagFormDialogComponent implements OnInit {

  formCtrl: FormControl;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: FlTagFormDialogInput,
              private dialogRef: MatDialogRef<FlTagFormDialogComponent>) {
  }

  ngOnInit(): void {
    this.initCtrl();
  }

  get title(): string {
    return this.input.title ?? 'flTag.update_tags';
  }

  private initCtrl(): void {
    this.formCtrl = new FormControl(this.input.tags);
  }

  submit(): void {
    if (this.formCtrl.valid && !this.isLoading) {
      this.updateTags(this.formCtrl.value);
    }
  }

  private updateTags(tags: FlTag[]): void {
    this.isLoading = true;
    this.input.updateMethod(tags).subscribe(
      newTags => this.onUpdateTagSuccess(newTags),
      () => this.isLoading = false
    );
  }

  private onUpdateTagSuccess(tags: FlTag[]): void {
    this.isLoading = false;
    this.dialogRef.close(tags);
  }

}
