import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaDocument, CaDocumentDatasource} from '../../../../../ca-core/model/entities/project/ca-document.class';
import {firstValueFrom} from 'rxjs';
import {FlPortalAction, FlPortalActionsService, FlTableColumn, FlTranslateService} from '@monorepo/front-core-lib';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';

/**
 * Card to list the document of the current project
 */
@Component({
  selector: 'ca-project-documents-list',
  templateUrl: './ca-project-documents-list.component.html',
  styleUrls: ['./ca-project-documents-list.component.scss']
})
export class CaProjectDocumentsListComponent implements OnInit, OnDestroy {

  documentDatasource: CaDocumentDatasource;

  columns: FlTableColumn<CaDocument>[] = ['name', 'size', 'creationInfo', 'actions'];

  private actionName = 'upload-project-document';
  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private state: CaProjectDetailState,
              private projectService: CaProjectService,
              private actionService: FlPortalActionsService,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    this.subscription.add(this.state.getProjectId$().subscribe(projectId => {
      this.getDocuments(projectId);
    }));

    this.subscription.add(this.actionService.getResult$(this.actionName).subscribe(action => {
      if (action?.status === 'success') {
        this.onDocumentUploaded(action.result, action.additionalInformation);
      }
    }));
  }

  private getDocuments(projectId: string): void {
    this.documentDatasource = this.projectService.getDocumentsDatasource(projectId);
  }

  async uploadDocument(fileEvent: File | File[]): Promise<void> {
    const projectId = await firstValueFrom(this.state.getProjectId$());
    const files = ClHelpService.convertObjectOrArrayToArray(fileEvent);

    for (const file of files) {

      const action: FlPortalAction = {
        type: this.actionName,
        action: this.projectService.uploadDocument(file, projectId),
        text: this.translateService.translate('uploading_document',
          {param: {name: file.name}}),
        additionalInformation: projectId
      };

      this.actionService.addAction(action, false);
    }
  }

  private async onDocumentUploaded(document: CaDocument, projectId: string): Promise<void> {
    const currentProjectId = await firstValueFrom(this.state.getProjectId$());
    if (currentProjectId !== projectId) return;
    this.documentDatasource.unshiftItem(document);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
