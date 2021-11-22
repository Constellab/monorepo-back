import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {
  FileResourceDatasource,
  FileResourcePreview
} from '../../../../../core/model/entities/resource/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {RouterService} from '../../../../../core/service/router.service';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';

@Component({
  selector: 'gen-file-resource-table',
  templateUrl: './file-resource-table.component.html',
  styleUrls: ['./file-resource-table.component.scss']
})
export class FileResourceTableComponent extends FlTableAbstractDirective<FileResourcePreview>
  implements OnInit {

  @Input() datasource: FileResourceDatasource;

  constructor(private fileService: FileResourceService,
              private resourceService: BioxResourceService,
              private dialogService: FlDialogService) {
    super(['createdAt', 'action', 'name']);
  }

  ngOnInit(): void {
  }

  downloadFile(file: FileResourcePreview): void {
    this.fileService.downloadFile(file.typingName, file.id, file.name).subscribe();
  }

  resourceFileRoute(file: FileResourcePreview): string {
    return RouterService.getBioxResourceDetailRoute(file.id);
  }

  deleteFile(file: FileResourcePreview): void {
    const input: FlConfirmDialogInput = {
      title: 'fe.delete_file',
      content: 'fe.delete_file_confirmation',
      translateTitleAndContent: true,
      observable: this.resourceService.delete(file.id),
      successMessage: 'fe.file_deleted',
      translateMessage: true
    }

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteFileClosed(result, file)
    )
  }

  private onDeleteFileClosed(result: FlConfirmDialogResult<void>, file: FileResourcePreview): void {
    if (result.choice) {
      this.datasource.removeItem(file);
    }
  }

}
