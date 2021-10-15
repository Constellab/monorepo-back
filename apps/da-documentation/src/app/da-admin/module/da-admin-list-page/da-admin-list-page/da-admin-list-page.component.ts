import { Component, OnInit } from '@angular/core';
import { FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService } from '@monorepo/front-core-lib';
import { DaDocumentationDTO} from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';
import { Router } from '@angular/router';
import { ClHelpService } from '@monorepo/core-lib';

@Component({
  selector: 'da-da-admin-list-page',
  templateUrl: './da-admin-list-page.component.html',
  styleUrls: ['./da-admin-list-page.component.scss']
})
export class DaAdminListPageComponent implements OnInit {

  documentations: DaDocumentationDTO[];
  publicDocsUrlPrefix: string;

  constructor(
    private daDocumentationService: DaDocumentationService,
    private dialogService: FlDialogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.publicDocsUrlPrefix = '../docs/';
    this.daDocumentationService.get().subscribe(docs => this.documentations = docs);
  }

  delete(id: string, i: number, event: globalThis.Event, j: number = null): void{
    ClHelpService.stopEventPropagation(event);
    const input: FlConfirmDialogInput = {
      title: 'confirm_deletion',
      content: 'confirm_deletion_message',
      translateTitleAndContent: true,
      observable: this.daDocumentationService.deleteById(id),
      successMessage: 'documentation_deleted',
      translateMessage: true
    }

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(res => {
      this.onCloseConfirmDialog(res, id, i, j);
    })
  }

  private onCloseConfirmDialog(res: FlConfirmDialogResult, id: string, i: number, j: number): void{
    if(res.choice){
      this.daDocumentationService.deleteById(id).subscribe(()=>{
        if(!j==null){
          this.documentations.splice(i, 1);
        }else{
          this.documentations[i].childs.splice(j, 1);
          if(this.documentations[i].childs.length == 0){
            this.documentations[i].asChild = false;
          }
        }
      });
    }
  }

  edit(id: string): string{
    return 'edit/' + id;
  }
}
