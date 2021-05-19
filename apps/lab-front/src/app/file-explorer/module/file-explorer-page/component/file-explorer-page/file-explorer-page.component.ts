import {Component, OnInit} from '@angular/core';
import {FileResource, FileResourceDatasource} from '../../../../../core/model/entities/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {
  FlDropFileEvent,
  FlPortalAction,
  FlPortalActionResult,
  FlPortalActionsService,
  FlTableColumn,
  FlTranslateService
} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-file-explorer-page',
  templateUrl: './file-explorer-page.component.html',
  styleUrls: ['./file-explorer-page.component.scss']
})
export class FileExplorerPageComponent implements OnInit {

  datasource: FileResourceDatasource;

  columns: FlTableColumn<FileResource>[] = ['id', {columnName: 'fe.path', accessor: 'path'}, 'createdAt', 'download'];

  files: File[];
  actionType: 'uploadFile';


  constructor(private labFileService: FileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    this.datasource = this.labFileService.getAllDatasource();

    this.actionsService.getResult$(this.actionType).subscribe(
      result => this.onFileUploadResult(result)
    );
  }

  onFileDrop(event: FlDropFileEvent): void {
    this.uploadFiles(event.files);
  }

  uploadFiles(fileEvent: File | File[]): void {
    const files: File[] = fileEvent as File[];
    if (files.length === 0) {
      return;
    }

    const text: string = files.length > 1 ?
      this.translateService.translate('fe.uploading_files', {param: {nbFiles: files.length}}) :
      files[0].name;

    const action: FlPortalAction = {
      text: text,
      type: this.actionType,
      action: this.labFileService.uploadFiles(files),
    };

    this.actionsService.addAction(action);

    // clear the list of files
    this.files = [];
  }

  private onFileUploadResult(result: FlPortalActionResult<FileResource>): void {
    if (result.status === 'success') {
      if (result.result.data.length > 0) {
        // todo when uploading multiple file the format is weird
        console.error('TODO !');
      } else {
        this.datasource.addItem(result.result, () => true);
      }
    }
  }
}
