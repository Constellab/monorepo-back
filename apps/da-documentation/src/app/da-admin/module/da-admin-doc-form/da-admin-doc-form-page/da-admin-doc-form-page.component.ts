import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';

@Component({
  selector: 'da-admin-doc-form-page',
  templateUrl: './da-admin-doc-form-page.component.html',
  styleUrls: ['./da-admin-doc-form-page.component.scss']
})
export class DaAdminDocFormPageComponent implements OnInit {

  doc: DaDocumentation = null;
  loaded = false;

  constructor(
    private daDocumentationService: DaDocumentationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) this.getById(params['id']).subscribe(documentation => {
          this.doc = documentation;
          this.loaded = true;
        });
      else this.loaded = true;
    });
  }

  private getById(id: string): Observable<DaDocumentation> {
    return this.daDocumentationService.getById(id);
  }
}
