import { Component, OnInit } from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {FileResource} from '../../../../../core/model/entities/file-resource.entity';

@Component({
  selector: 'gen-file-resource-table',
  templateUrl: './file-resource-table.component.html',
  styleUrls: ['./file-resource-table.component.scss']
})
export class FileResourceTableComponent extends FlTableAbstractDirective<FileResource>
  implements OnInit {

  constructor() {
    super([])
  }

  ngOnInit(): void {
  }

}
