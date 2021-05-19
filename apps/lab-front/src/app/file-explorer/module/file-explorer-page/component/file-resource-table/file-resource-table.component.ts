import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {FileResource, FileResourceDatasource} from '../../../../../core/model/entities/file-resource.entity';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';

@Component({
  selector: 'gen-file-resource-table',
  templateUrl: './file-resource-table.component.html',
  styleUrls: ['./file-resource-table.component.scss']
})
export class FileResourceTableComponent extends FlTableAbstractDirective<FileResource>
  implements OnInit {

  @Input() datasource: FileResourceDatasource;

  constructor(private fileService: FileResourceService) {
    super(['createdAt', 'download'])
  }

  ngOnInit(): void {
  }

  downloadFile(file: FileResource): void{
    this.fileService.downloadFile(file.type, file.id).subscribe();
  }

}
