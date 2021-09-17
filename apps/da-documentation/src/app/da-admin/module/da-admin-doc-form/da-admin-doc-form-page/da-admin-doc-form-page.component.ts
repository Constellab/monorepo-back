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
  search = false;

  constructor(
    private daDocumentationService: DaDocumentationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // FL Loader
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) this.getById(params['id']).subscribe(documentation => {
          this.doc = documentation;
          this.search = true;
        });
      else this.search = true;
    });
  }

  private getById(id: string): Observable<DaDocumentation> {
    return this.daDocumentationService.getById(id);
  }
}
