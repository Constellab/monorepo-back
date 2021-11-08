/* eslint-disable @typescript-eslint/member-ordering */
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService } from '@monorepo/front-core-lib';
import { DaDocumentationDTO} from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';
import { Router } from '@angular/router';
import { ClHelpService } from '@monorepo/core-lib';
import {DaMateTreeFlatDataSource, DaNode} from '../../../../da-core/da-model/da-entities/da-node.class';
import {DaFolderService} from '../../../../da-core/da-service/da-folder.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'da-da-admin-list-page',
  templateUrl: './da-admin-list-page.component.html',
  styleUrls: ['./da-admin-list-page.component.scss']
})
export class DaAdminListPageComponent implements OnInit {

  documentations: DaDocumentationDTO[];
  publicDocsUrlPrefix: string;

  private _transformer = (node: DaNode, level: number):any => {
    return {
      expandable: !!node.children,
      name: node.name,
      order: node.order,
      path: node.path,
      id: node.id,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new DaMateTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private daDocumentationService: DaDocumentationService,
    private dialogService: FlDialogService,
    private daFolderService: DaFolderService,
  ) {}

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnInit(): void {
    this.publicDocsUrlPrefix = '../docs/';
    this.daDocumentationService.get().subscribe(docs => {
      this.documentations = docs
    });

    this.daFolderService.getTree().subscribe((data) => {
      this.dataSource.data = data.children;
    });

  }

  delete(id: string, event: globalThis.Event): void{
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
      this.onCloseConfirmDialog(res, id);
    })
  }

  private onCloseConfirmDialog(res: FlConfirmDialogResult, id: string): void{
    if(res.choice){
      this.daDocumentationService.deleteById(id).subscribe(()=>{
        let r: boolean;
        [this.dataSource.data, r] = this.dataSource.deleteNode(this.dataSource.data, id);
      });
    }
  }

  edit(id: string): string{
    return 'edit/' + id;
  }

}
