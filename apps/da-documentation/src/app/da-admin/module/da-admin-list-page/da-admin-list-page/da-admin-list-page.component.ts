/* eslint-disable @typescript-eslint/member-ordering */
import {Component, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput,
} from '@monorepo/front-core-lib';
import {DaDocumentationDTO} from '../../../../da-core/da-model/da-entities/da-documentation.class';
import {DaDocumentationService} from '../../../../da-core/da-service/da-documentation.service';
import {ClHelpService} from '@monorepo/core-lib';
import {DaMateTreeFlatDataSource, DaNode} from '../../../../da-core/da-model/da-entities/da-node.class';
import {DaFolderService} from '../../../../da-core/da-service/da-folder.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {DaFolder, DaFolderDTO} from '../../../../da-core/da-model/da-entities/da-folder.class';
import {DaAdminListPageFormDialogComponent} from '../da-admin-list-page-form-dialog/da-admin-list-page-form-dialog.component';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
}

@Component({
  selector: 'da-admin-list-page',
  templateUrl: './da-admin-list-page.component.html',
  styleUrls: ['./da-admin-list-page.component.scss']
})
export class DaAdminListPageComponent implements OnInit {


  isUpdate = false;
  documentations: DaDocumentationDTO[];
  publicDocsUrlPrefix: string;

  private _transformer = (node: DaNode, level: number): any => {
    return {
      expandable: !!node.children,
      order: node.order,
      name: node.name,
      path: node.path,
      completePath: node.completePath,
      parentId: node.parentId,
      id: node.id,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
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
  ) {
  }

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

  delete(id: string, event: globalThis.Event): void {
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

  private onCloseConfirmDialog(res: FlConfirmDialogResult, id: string): void {
    if (res.choice) {
      this.daDocumentationService.deleteById(id).subscribe(() => {
        this.dataSource.delete(id);
      });
    }
  }

  editFolder(folder?: DaNode): void {
    if (folder) {
      this.openUpdateDialog(folder);
    } else {
      this.openCreateDialog();
    }
  }

  openCreateDialog(): void {
    const input: FlFormDialogInput<DaFolderDTO> = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(DaAdminListPageFormDialogComponent, {data: input}).afterClosed().subscribe(
      (res: DaFolder) => {
        //this.dataSource.updateNodes(new DaNode(res.id, res.path, res.completePath, res.title, res.order, res.folder.id));
        this.daFolderService.getTree().subscribe(folder => {
          this.dataSource.data = folder.children;
          this.expandParentToNode(res.id, this.dataSource.data);
        });
      }
    );
  }

  openUpdateDialog(node: DaNode): void {

    const folderForm: DaFolderDTO = {
      title: node.name,
      folderId: node.parentId,
      path: node.path,
      id: node.id,
      order: node.order
    };

    const input: FlFormDialogInput<DaFolderDTO> = {
      object: folderForm,
      mode: 'update'
    };

    this.dialogService.openSmallDialog(DaAdminListPageFormDialogComponent, {data: input}).afterClosed().subscribe(
      (res: DaFolder) => {
        this.setDataSource(res);
      }
    );
  }

  private setDataSource(res: DaFolder): void {
    this.daFolderService.getTree().subscribe(folder => {
      this.dataSource.data = folder.children;
      this.expandParentToNode(res.id, this.dataSource.data);
    });
  }

  private expandParentToNode(id: string, data: DaNode[]): boolean {
    const node: DaNode = data.find(n => n.id == id);
    if (!node) {
      data.map(n => {
        if (n.children != null && this.expandParentToNode(id, n.children)) {
          this.treeControl.expand(this.treeControl.dataNodes.find(no => no.id == n.id));
          return true;
        }
        return false;
      });
      return false;
    }

    this.treeControl.expand(this.treeControl.dataNodes.find(no => no.id == node.id));
    return true;

  }

  edit(id: string): string {
    return 'edit/' + id;
  }

  deleteFolder(id: string, parentId: string): void {
    ClHelpService.stopEventPropagation(event);
    const input: FlConfirmDialogInput = {
      title: 'confirm_deletion',
      content: 'confirm_deletion_message',
      translateTitleAndContent: true,
      observable: this.daDocumentationService.deleteById(id),
      successMessage: 'folder_deleted',
      translateMessage: true
    }

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(res => {
      this.onCloseConfirmDialogFolder(res, id, parentId);
    });
  }

  private onCloseConfirmDialogFolder(res: FlConfirmDialogResult, id: string, parentId: string): void {
    if (res.choice) {
      this.daFolderService.deleteById(id).subscribe(() => {
        this.dataSource.delete(id);

        this.expandParentToNode(parentId, this.dataSource.data);
      });
    }
  }

}
