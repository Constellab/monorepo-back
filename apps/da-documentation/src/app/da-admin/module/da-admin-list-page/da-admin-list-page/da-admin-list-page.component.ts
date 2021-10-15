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

  delete(id: string, i: number, event: globalThis.Event): void{
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
      this.onCloseConfirmDialog(res, id, i);
    })
  }

  private onCloseConfirmDialog(res: FlConfirmDialogResult, id: string, i: number): void{
    if(res.choice){
      this.daDocumentationService.deleteById(id).subscribe(()=>{
        this.documentations.splice(i, 1);
      });
    }
  }

  edit(id: string): string{
    return 'edit/' + id;
  }
}
