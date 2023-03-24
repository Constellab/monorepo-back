import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/ca-environment';
import {CaCurrentSpaceService} from '../../../ca-core/service-api/ca-current-space.service';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../ca-core/model/entities/space/ca-space.class';
import {CaUserDatasourcePaginated} from '../../../ca-core/model/entities/ca-user.class';
import {FlThemeService} from '@monorepo/front-core-lib';
import {IConfig} from '@onlyoffice/document-editor-angular';

/**
 * Page containing the user dashboard
 */
@Component({
  selector: 'ca-dashboard-page',
  templateUrl: './ca-dashboard-page.component.html',
  styleUrls: ['./ca-dashboard-page.component.scss']
})
export class CaDashboardPageComponent implements OnInit, OnDestroy {

  hubLink: string = environment.hubUrl;

  currentSpace$: Observable<CaSpace> = this.currentSpaceService.getCurrentSpace$();
  spaceUsers: CaUserDatasourcePaginated = this.currentSpaceService.getCurrentSpaceUsersDatasource();

  currentDate: Date = new Date();

  config: IConfig;

  constructor(private currentSpaceService: CaCurrentSpaceService,
              private themeService: FlThemeService) {
  }

  onDocumentReady = (event: any): void => {
    console.log('Document is loaded');
  };

  ngOnInit(): void {
    // this.config = {
    //   "document": {
    //     "key": "Khirz6zTPdfd7",
    //     "permissions": {
    //       "comment": true,
    //       "commentGroups": {
    //         "edit": ["Group2", ""],
    //         "remove": [""],
    //         "view": ""
    //       },
    //       "copy": true,
    //       "deleteCommentAuthorOnly": false,
    //       "download": true,
    //       "edit": true,
    //       "editCommentAuthorOnly": false,
    //       "fillForms": true,
    //       "modifyContentControl": true,
    //       "modifyFilter": true,
    //       "print": true,
    //       "review": true,
    //       "reviewGroups": ["Group1", "Group2", ""]
    //     },
    //     "url": "http://localhost:80/pd_policy.docx"
    //   },
    //   "editorConfig": {
    //     "callbackUrl": "https://example.com/url-to-callback.ashx",
    //     "mode": "edit",
    //     "user": {
    //       "group": "Group1",
    //       "id": "78e1e841",
    //       "name": "Smith"
    //     }
    //   },
    //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudCI6eyJrZXkiOiJLaGlyejZ6VFBkZmQ3IiwicGVybWlzc2lvbnMiOnsiY29tbWVudCI6dHJ1ZSwiY29tbWVudEdyb3VwcyI6eyJlZGl0IjpbIkdyb3VwMiIsIiJdLCJyZW1vdmUiOlsiIl0sInZpZXciOiIifSwiY29weSI6dHJ1ZSwiZGVsZXRlQ29tbWVudEF1dGhvck9ubHkiOmZhbHNlLCJkb3dubG9hZCI6dHJ1ZSwiZWRpdCI6dHJ1ZSwiZWRpdENvbW1lbnRBdXRob3JPbmx5IjpmYWxzZSwiZmlsbEZvcm1zIjp0cnVlLCJtb2RpZnlDb250ZW50Q29udHJvbCI6dHJ1ZSwibW9kaWZ5RmlsdGVyIjp0cnVlLCJwcmludCI6dHJ1ZSwicmV2aWV3Ijp0cnVlLCJyZXZpZXdHcm91cHMiOlsiR3JvdXAxIiwiR3JvdXAyIiwiIl19LCJ1cmwiOiJodHRwOi8vbG9jYWxob3N0OjgwL3BkX3BvbGljeS5kb2N4In0sImVkaXRvckNvbmZpZyI6eyJjYWxsYmFja1VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXJsLXRvLWNhbGxiYWNrLmFzaHgiLCJtb2RlIjoiZWRpdCIsInVzZXIiOnsiZ3JvdXAiOiJHcm91cDEiLCJpZCI6Ijc4ZTFlODQxIiwibmFtZSI6IlNtaXRoIn19LCJpYXQiOjE2Nzk2NTM0MTgsImV4cCI6MTY3OTgyNjIxOH0.lSnyR51C6DrgKDvX9Z7hWuQ6RI26_HNYG1kDmZu3Mac'
    // } as any;

    // la connexion token a été desactivé dans le docker, fichier : /etc/onlyoffice/documentserver/local.json.
    //https://api.onlyoffice.com/editors/signature/

    this.config = {
      'document': {
        'fileType': 'docx',
        'key': 'AAA', // clé unique qu'on donne au fichier. Si le fichier avec la clé existe deja, il utilise la version existante (qu'il a du telecharger)
        'title': 'Example Document Title.docx',
        'url': 'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/News for update 0.3.16.docx'
      },
      'documentType': 'word',
      'editorConfig': {
        // quand on met un url vers une vraie route, ça marche pas, sinon y'a un warning mais le fichier s'affiche
        'callbackUrl': 'docker.host.internal:3001/auth/generateToken/monsecreet'
      },
      // token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      // token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudCI6eyJrZXkiOiJLaGlyejZ6VFBkZmQ3IiwicGVybWlzc2lvbnMiOnsiY29tbWVudCI6dHJ1ZSwiY29tbWVudEdyb3VwcyI6eyJlZGl0IjpbIkdyb3VwMiIsIiJdLCJyZW1vdmUiOlsiIl0sInZpZXciOiIifSwiY29weSI6dHJ1ZSwiZGVsZXRlQ29tbWVudEF1dGhvck9ubHkiOmZhbHNlLCJkb3dubG9hZCI6dHJ1ZSwiZWRpdCI6dHJ1ZSwiZWRpdENvbW1lbnRBdXRob3JPbmx5IjpmYWxzZSwiZmlsbEZvcm1zIjp0cnVlLCJtb2RpZnlDb250ZW50Q29udHJvbCI6dHJ1ZSwibW9kaWZ5RmlsdGVyIjp0cnVlLCJwcmludCI6dHJ1ZSwicmV2aWV3Ijp0cnVlLCJyZXZpZXdHcm91cHMiOlsiR3JvdXAxIiwiR3JvdXAyIiwiIl19LCJ1cmwiOiJodHRwOi8vbG9jYWxob3N0OjgwL3BkX3BvbGljeS5kb2N4In0sImVkaXRvckNvbmZpZyI6eyJjYWxsYmFja1VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXJsLXRvLWNhbGxiYWNrLmFzaHgiLCJtb2RlIjoiZWRpdCIsInVzZXIiOnsiZ3JvdXAiOiJHcm91cDEiLCJpZCI6Ijc4ZTFlODQxIiwibmFtZSI6IlNtaXRoIn19LCJpYXQiOjE2Nzk2NTM2MTYsImV4cCI6MTY3OTgyNjQxNn0.KxlWq62NEiAaSF-0KoAQyrM4hSLvwsGMZNPzkaxdDoA'
    };
    // const a = DocsAPI as any;
    // const docEditor = new DocsAPI.DocEditor('placeholder', config);
  }

  ngOnDestroy(): void {
    this.spaceUsers.disconnect();
  }
}
