import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaDocument, CaDocumentDatasource} from '../../../../../ca-core/model/entities/project/ca-document.class';

@Component({
  selector: 'ca-document-table',
  templateUrl: './ca-document-table.component.html',
  styleUrls: ['./ca-document-table.component.scss']
})
export class CaDocumentTableComponent extends FlTableAbstractDirective<CaDocument>
  implements OnInit {

  @Input() datasource: CaDocumentDatasource;

  constructor() {
    super(['name', 'size', 'creationInfo', 'actions']);
  }

  ngOnInit(): void {
  }

  updateDocument(doc: CaDocument): void {
    this.datasource.updateItem(doc);
  }

  deleteDocument(document: CaDocument): void {
    this.datasource.removeItem(document);
  }


}
