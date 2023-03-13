import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {ClYoutubeHelper} from '@monorepo/core-lib';


export interface FlTextEditorLinkDialogInput {
  title: string;
}


@Component({
  selector: 'fl-text-editor-link-dialog',
  templateUrl: './fl-text-editor-link-dialog.component.html',
  styleUrls: ['./fl-text-editor-link-dialog.component.scss']
})
export class FlTextEditorLinkDialogComponent implements OnInit {

  linkControl: FormControl<string>;

  title: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: FlTextEditorLinkDialogInput,
              private dialogRef: MatDialogRef<FlTextEditorLinkDialogComponent>) {
    this.title = data.title;
  }

  ngOnInit(): void {
    this.linkControl = new FormControl<string>(null, [Validators.required, this.isYoutubeVideo()]);
  }

  submit(): void {
    if (this.linkControl.valid) {
      this.dialogRef.close(this.linkControl.value);
    }
  }

  public isYoutubeVideo(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value: string = control.value;
      if (value == null || value.length === 0) {
        return null;
      }

      if (!ClYoutubeHelper.isYoutubeVideoOrEmbedUrl(value)) {
        return {notYoutube: 'flTextEditor.not_youtube_link_error'};
      }
      return null;
    };
  }
}
