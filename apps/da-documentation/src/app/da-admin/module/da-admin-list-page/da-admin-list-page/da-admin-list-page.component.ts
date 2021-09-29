import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService } from '@monorepo/front-core-lib';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'da-da-admin-list-page',
  templateUrl: './da-admin-list-page.component.html',
  styleUrls: ['./da-admin-list-page.component.scss']
})
export class DaAdminListPageComponent implements OnInit {

  documentations: DaDocumentation[];

  constructor(
    private daDocumentationService: DaDocumentationService,
    private dialogService: FlDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getDocumentations().subscribe(docs => {
      this.documentations = docs;
    });
  }

  private getDocumentations(): Observable<DaDocumentation[]>{
    
    return this.daDocumentationService.get();
    
  }

  // TODO: Est-ce normal que je dois quand meme ref admin ?
  create(): void{
    this.router.navigate(['admin','edit']);
  }

  edit(id: string): void{
    this.router.navigate(['admin', 'edit', id]);
  }

  delete(id: string, i: number): void{
    const input: FlConfirmDialogInput = {
      title: 'Confirm deletion',
      content: 'Confirm the deletion?',
      translateTitleAndContent: false
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
}
