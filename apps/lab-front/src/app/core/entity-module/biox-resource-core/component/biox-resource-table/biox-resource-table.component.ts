import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {FileResourceService} from '../../../../entity-service/file-resource.service';
import {RouterService} from '../../../../service/router.service';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {BioxResource, BioxResourceDatasource} from '../../../../model/entities/resource/biox-resource.entity';

@Component({
  selector: 'gen-biox-resource-table',
  templateUrl: './biox-resource-table.component.html',
  styleUrls: ['./biox-resource-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceTableComponent extends FlTableAbstractDirective<BioxResource>
  implements OnInit {

  @Input() datasource: BioxResourceDatasource;

  constructor(private fileService: FileResourceService,
              private resourceService: BioxResourceService,
              private dialogService: FlDialogService) {
    super(['createdAt', 'action', 'name', 'info']);
  }

  ngOnInit(): void {
  }

  downloadFile(file: BioxResource): void {
    this.fileService.downloadFile(file.typingName, file.id, file.name).subscribe();
  }

  getDownloadFileRoute(file: BioxResource): string {
    return this.fileService.getDownloadFileRoute(file.typingName, file.id);
  }

  resourceFileRoute(file: BioxResource): string {
    return RouterService.getBioxResourceDetailRoute(file.id);
  }

  deleteFile(file: BioxResource): void {
    const input: FlConfirmDialogInput = {
      title: 'fe.delete_file',
      content: 'fe.delete_file_confirmation',
      translateTitleAndContent: true,
      observable: this.resourceService.delete(file.id),
      successMessage: 'fe.file_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteFileClosed(result, file)
    );
  }

  private onDeleteFileClosed(result: FlConfirmDialogResult<void>, file: BioxResource): void {
    if (result.choice) {
      this.datasource.removeItem(file);
    }
  }

}
