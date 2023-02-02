import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaConstellabDocument, CaDocument} from '../../../../../ca-core/model/entities/project/ca-document.class';
import {CmRichTextI} from '@monorepo/common-model';
import {FlDebouncer, FlDialogService, FlTextEditorConfig} from '@monorepo/front-core-lib';
import {CaDocumentTextEditorConfig} from '../../../ca-document-core/ca-document-text-editor-config.class';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

/**
 * Page to show a constellab document with the possibility to edit it.
 */
@Component({
  selector: 'ca-document-detail-page',
  templateUrl: './ca-document-detail-page.component.html',
  styleUrls: ['./ca-document-detail-page.component.scss']
})
export class CaDocumentDetailPageComponent implements OnInit, OnDestroy {

  document: CaDocument;
  documentContent: CmRichTextI;

  textEditorConfig: FlTextEditorConfig;

  isLoading: boolean = true;

  editMode: boolean = false;

  private contentDebouncer: FlDebouncer<CmRichTextI>;


  constructor(private route: ActivatedRoute,
              private projectService: CaProjectService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.documentId)
    );

    //create a debouncer to save the description after x second of idle
    this.contentDebouncer = new FlDebouncer(5000);
    this.contentDebouncer.getDebouncedValue().subscribe(
      value => {
        this.saveContent(value);
      }
    );
  }

  private init(id: string): void {
    this.projectService.getConstellabDocument(id).subscribe({
      next: doc => this.getDocumentSuccess(doc),
      error: () => this.isLoading = false
    });
  }

  private getDocumentSuccess(constellabDocument: CaConstellabDocument): void {
    this.document = constellabDocument.document;
    this.documentContent = constellabDocument.content;
    this.textEditorConfig = new CaDocumentTextEditorConfig(constellabDocument.document.id,
      this.projectService, this.dialogService);
    this.isLoading = false;
  }

  onContentUpdate(content: CmRichTextI): void {
    this.contentDebouncer.setValue(content);
  }

  private saveContent(content: CmRichTextI): void {
    this.projectService.updateConstellabDocument(this.document.id, content).subscribe(
      doc => this.updateDocument(doc.document)
    );
  }

  updateDocument(document: CaDocument): void {
    this.document = document;
  }

  deleteDocument(): void {
    this.routerService.navigateToProjectDetail(this.document.projectId);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  print(): void {
    if (window) {
      window.print();
    }
  }

  ngOnDestroy(): void {
    this.contentDebouncer?.markForComplete();
  }

}
