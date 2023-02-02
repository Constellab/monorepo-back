import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaDocument} from '../../../../../ca-core/model/entities/project/ca-document.class';
import {
  CaDocumentNameFormDialogComponent,
  CaDocumentNameFormDialogInput
} from '../ca-document-name-form-dialog/ca-document-name-form-dialog.component';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';

@Component({
  selector: 'ca-document-actions-menu',
  templateUrl: './ca-document-actions-menu.component.html',
  styleUrls: ['./ca-document-actions-menu.component.scss']
})
export class CaDocumentActionsMenuComponent implements OnInit {

  @Input() document: CaDocument;

  @Input() showViewLinks: boolean = true;

  @Output() documentUpdated: EventEmitter<CaDocument> = new EventEmitter();
  @Output() documentDeleted: EventEmitter<CaDocument> = new EventEmitter();

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService) {
  }

  ngOnInit(): void {
  }

  getDocumentPreviewUrl(): string {
    return this.projectService.getDocumentPreviewUrl(this.document.projectId, this.document.name);
  }

  getDocumentDownloadUrl(): string {
    return this.projectService.getDocumentDownloadUrl(this.document.projectId, this.document.name);
  }

  renameDocument(): void {
    const input: CaDocumentNameFormDialogInput = {
      mode: 'update',
      object: {name: this.document.name},
      documentId: this.document.id,
      projectId: this.document.projectId
    };

    this.dialogService.openSmallDialog(CaDocumentNameFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onRenameClosed(result)
    );
  }

  private onRenameClosed(doc?: CaDocument): void {
    if (doc) {
      this.documentUpdated.emit(doc);
    }
  }

  deleteDocument(): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_document',
      content: 'delete_document_confirmation',
      translateTitleAndContent: true,
      observable: this.projectService.deleteDocument(this.document.id),
      successMessage: 'document_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, this.document)
    );
  }

  onDeleteClosed(result: FlConfirmDialogResult, document: CaDocument): void {
    if (result.choice) {
      this.documentDeleted.emit(document);
    }
  }

}
