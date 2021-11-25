import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  FileResourceDatasource,
  FileResourcePreview
} from '../../../../../core/model/entities/resource/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {
  FlDialogService,
  FlDropFileEvent,
  FlFileHelper,
  FlPortalActionResult,
  FlPortalActionsService,
  FlSnackBarService,
  FlTableColumn,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {
  UploadFsNodeDialogComponent,
  UploadFsNodeDialogInput,
  UploadFsNodeMode
} from '../upload-fs-node-dialog/upload-fs-node-dialog.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'gen-file-explorer-page',
  templateUrl: './file-explorer-page.component.html',
  styleUrls: ['./file-explorer-page.component.scss']
})
export class FileExplorerPageComponent implements OnInit, OnDestroy {

  datasource: FileResourceDatasource;

  columns: FlTableColumn<FileResourcePreview>[] = ['id', 'name', {columnName: 'fe.path', accessor: 'path'},
    {columnName: 'fe.file_type', accessor: 'resourceTypeHumanName'}, 'createdAt', 'action'];

  files: File[];
  actionType: 'uploadFile';

  private subscription: Subscription;

  constructor(private labFileService: FileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService,
              private dialogService: FlDialogService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.datasource = this.labFileService.getAllDatasource();

    this.subscription = this.actionsService.getResult$(this.actionType).subscribe(
      result => this.onFileUploadResult(result)
    );
  }

  onFileDrop(event: FlDropFileEvent): void {
    // don't keep the folder
    const files: File[] = event.files.filter(file => !FlFileHelper.isFolder(file));

    if (files.length === 0) {
      this.snackBarService.openErrorMessage('fe.drop_folders_error', true);
      return;
    }

    this.uploadFiles(event.files);
  }

  uploadFiles(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'files');
  }

  uploadFolder(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'folder');
  }

  private uploadFsNode(fileEvent: File | File[], selectedNodes: UploadFsNodeMode): void {
    const files: File[] = fileEvent as File[];
    if (files.length === 0) {
      return;
    }

    const data: UploadFsNodeDialogInput = {
      selectedNodes: selectedNodes,
      files: files
    };
    this.dialogService.openSmallDialog(UploadFsNodeDialogComponent, {data: data});

    // clear the list of files
    this.files = [];
  }

  private onFileUploadResult(result: FlPortalActionResult<FileResourcePreview | FileResourcePreview[]>): void {
    if (result.status === 'success') {
      // if multiple file were uploaded
      this.datasource.addItem(result.result, () => true);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
