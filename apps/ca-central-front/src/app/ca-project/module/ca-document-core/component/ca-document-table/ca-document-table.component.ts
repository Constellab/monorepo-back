import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaDocument, CaDocumentDatasource} from '../../../../../ca-core/model/entities/project/ca-document.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';

@Component({
  selector: 'ca-document-table',
  templateUrl: './ca-document-table.component.html',
  styleUrls: ['./ca-document-table.component.scss']
})
export class CaDocumentTableComponent extends FlTableAbstractDirective<CaDocument>
  implements OnInit {

  @Input() datasource: CaDocumentDatasource;

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService) {
    super(['name', 'size', 'creationInfo', 'actions']);
  }

  ngOnInit(): void {
  }

  getDocumentPreviewUrl(document: CaDocument): string {
    return this.projectService.getDocumentPreviewUrl(document.projectId, document.filePath);
  }


  getDocumentDownloadUrl(document: CaDocument): string {
    return this.projectService.getDocumentDownloadUrl(document.projectId, document.filePath);
  }

  deleteDocument(document: CaDocument): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_document',
      content: 'delete_document_confirmation',
      translateTitleAndContent: true,
      observable: this.projectService.deleteDocument(document.id),
      successMessage: 'document_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, document)
    );
  }

  onDeleteClosed(result: FlConfirmDialogResult, document: CaDocument): void {
    if (result.choice) {
      this.datasource.removeItem(document);
    }
  }


}
