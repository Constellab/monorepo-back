import {Component, OnInit} from '@angular/core';
import {FileResourceDatasource, FileResourcePreview} from '../../../../../core/model/entities/resource/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {
  FlDialogService,
  FlDropFileEvent,
  FlPortalActionResult,
  FlPortalActionsService,
  FlTableColumn,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {SelectFileTypesDialogComponent, SelectFileTypesDialogInput} from '../select-file-types-dialog/select-file-types-dialog.component';

@Component({
  selector: 'gen-file-explorer-page',
  templateUrl: './file-explorer-page.component.html',
  styleUrls: ['./file-explorer-page.component.scss']
})
export class FileExplorerPageComponent implements OnInit {

  datasource: FileResourceDatasource;

  columns: FlTableColumn<FileResourcePreview>[] = ['id', 'name', {columnName: 'fe.path', accessor: 'path'},
    {columnName: 'fe.file_type', accessor: 'resourceTypeHumanName'}, 'createdAt', 'action'];

  files: File[];
  actionType: 'uploadFile';


  constructor(private labFileService: FileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService,
              private dialogService: FlDialogService) {
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

    const data: SelectFileTypesDialogInput[] = files.map(file => {
      return {file: file, typingName: null};
    });
    this.dialogService.openSmallDialog(SelectFileTypesDialogComponent, {data: data});

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
