import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';

@Component({
  selector: 'da-da-public-doc-page',
  templateUrl: './da-public-doc-page.component.html',
  styleUrls: ['./da-public-doc-page.component.scss']
})
export class DaPublicDocPageComponent implements OnInit {

  path: string;
  documentation: DaDocumentation;

  constructor(
    private activatedRoute: ActivatedRoute,
    private daDocumentationService: DaDocumentationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      this.path = url.join('/');
      this.getDocumentationByPath(this.path).subscribe(doc => {
        this.documentation = doc;
        if(this.documentation){
          document.querySelector('#docTitle').innerHTML = `<h1>${this.documentation.title}</h1>`;
          document.querySelector('#docContent').innerHTML = this.documentation.content;
        }
      }
      ,
      error => {
        console.log(error);
      });
    });
  }

  private getDocumentationByPath(path: string): Observable<DaDocumentation>{
    return this.daDocumentationService.getByPath(path);
  }

}
