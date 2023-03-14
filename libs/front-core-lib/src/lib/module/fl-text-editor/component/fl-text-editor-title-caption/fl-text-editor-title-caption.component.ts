import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {MatDialogRef} from '@angular/material/dialog';


/**
 * Component inside text editor to show title and caption with possibility to edit them
 */
@Component({
  selector: 'fl-text-editor-title-caption',
  templateUrl: './fl-text-editor-title-caption.component.html',
  styleUrls: ['./fl-text-editor-title-caption.component.scss']
})
export class FlTextEditorTitleCaptionComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Output() titleChange: EventEmitter<string> = new EventEmitter();

  @Input() caption: string;
  @Output() captionChange: EventEmitter<string> = new EventEmitter();

  @Input() editable: boolean;

  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<unknown>;

  private dialogRef: MatDialogRef<any>;


  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }


  openEditDialog(): void {
    this.dialogRef = this.dialogService.openSmallDialog(this.templatePortalContent);
  }

  closeDialog(): void {
    this.dialogRef?.close();
    this.titleChange.next(this.title);
    this.captionChange.next(this.caption);
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }
}
