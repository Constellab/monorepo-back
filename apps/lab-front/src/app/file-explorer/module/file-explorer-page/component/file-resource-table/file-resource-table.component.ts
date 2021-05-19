import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {FileResource, FileResourceDatasource} from '../../../../../core/model/entities/file-resource.entity';

@Component({
  selector: 'gen-file-resource-table',
  templateUrl: './file-resource-table.component.html',
  styleUrls: ['./file-resource-table.component.scss']
})
export class FileResourceTableComponent extends FlTableAbstractDirective<FileResource>
  implements OnInit {

  @Input() datasource: FileResourceDatasource;

  constructor() {
    super(['createdAt'])
  }

  ngOnInit(): void {
  }

}
