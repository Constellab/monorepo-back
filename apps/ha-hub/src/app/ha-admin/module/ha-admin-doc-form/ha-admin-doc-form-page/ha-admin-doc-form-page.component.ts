import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {HaDocumentation} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';

@Component({
  selector: 'ha-admin-doc-form-page',
  templateUrl: './ha-admin-doc-form-page.component.html',
  styleUrls: ['./ha-admin-doc-form-page.component.scss']
})
export class HaAdminDocFormPageComponent implements OnInit {

  doc: HaDocumentation = null;
  loaded = false;
  backToListLink = '../';

  constructor(
    private daDocumentationService: HaDocumentationService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) this.getById(params['id']).subscribe(documentation => {
        this.doc = documentation;
        this.doc.folderId = this.doc.folder.id;
        this.loaded = true;
        this.backToListLink = '../../'
      });
      else this.loaded = true;
    });
  }

  private getById(id: string): Observable<HaDocumentation> {
    return this.daDocumentationService.getById(id);
  }
}
