import {Component, OnInit} from '@angular/core';
import {FileResourceDatasource, FileResourcePreview} from '../../../../../core/model/entities/resource/file-resource.entity';
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

  columns: FlTableColumn<FileResourcePreview>[] = ['id', 'filename', {columnName: 'fe.path', accessor: 'path'}, 'createdAt', 'action'];

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

    this.actionsService.addAction(action, true);

    // clear the list of files
    this.files = [];
  }

  private onFileUploadResult(result: FlPortalActionResult<FileResourcePreview | FileResourcePreview[]>): void {
    if (result.status === 'success') {
      // if multiple file were uploaded
      this.datasource.addItem(result.result, () => true);
    }
  }
}
