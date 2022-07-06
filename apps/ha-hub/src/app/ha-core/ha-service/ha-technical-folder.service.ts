import { Injectable } from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaDocumentationSearchDTO} from '../ha-model/ha-entities/ha-documentation.class';

@Injectable({
  providedIn: 'root'
})
export class HaTechnicalFolderService {

  private readonly route: string = 'technical-folder';

  constructor(private apiService: FlApiService) { }

  public findTechDocumentationByLink(link: string):  Observable<HaDocumentationSearchDTO>{
    return this.apiService.post(`${this.route}/get-tech-doc-by-link`, {link: link});
  }
}
