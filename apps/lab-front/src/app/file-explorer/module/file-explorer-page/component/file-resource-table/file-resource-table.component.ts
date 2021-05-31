import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {FileResourcePreview, FileResourceDatasource} from '../../../../../core/model/entities/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {RouterService} from '../../../../../core/service/router.service';

@Component({
  selector: 'gen-file-resource-table',
  templateUrl: './file-resource-table.component.html',
  styleUrls: ['./file-resource-table.component.scss']
})
export class FileResourceTableComponent extends FlTableAbstractDirective<FileResourcePreview>
  implements OnInit {

  @Input() datasource: FileResourceDatasource;

  constructor(private fileService: FileResourceService) {
    super(['createdAt', 'action']);
  }

  ngOnInit(): void {
  }

  downloadFile(file: FileResourcePreview): void {
    this.fileService.downloadFile(file.type, file.id, file.getFileName()).subscribe();
  }

  resourceFileRoute(file: FileResourcePreview): string {
    return RouterService.getBioxResourceDetailRoute(file.type, file.id);
  }

}
