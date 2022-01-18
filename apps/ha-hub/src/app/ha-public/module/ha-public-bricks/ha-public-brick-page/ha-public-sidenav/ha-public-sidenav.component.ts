/* eslint-disable @typescript-eslint/member-ordering */
import {Component, OnInit} from '@angular/core';
import {HaAuthService} from '../../../../../ha-core/ha-service/ha-auth.service';
import {HaMateTreeFlatDataSource, HaNode, HaNodeDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {HaFolderService} from '../../../../../ha-core/ha-service/ha-folder.service';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlContextMenuConfig,
  FlContextMenuService,
  FlDialogService, FlFormDialogInput
} from '@monorepo/front-core-lib';
import {HaDocumentationService} from '../../../../../ha-core/ha-service/ha-documentation.service';
import {HaFolder, HaFolderDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-folder.class';
import {HaAdminListPageFormDialogComponent} from '../../../../../ha-admin/module/ha-admin-list-page/ha-admin-list-page-form-dialog/ha-admin-list-page-form-dialog.component';
import {HaPublicSidenavCreateFormDialogComponent} from './ha-public-sidenav-create-form-dialog/ha-public-sidenav-create-form-dialog.component';
import {HaDocumentation} from '../../../../../ha-core/ha-model/ha-entities/ha-documentation.class';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
}

@Component({
  selector: 'ha-public-sidenav',
  templateUrl: './ha-public-sidenav.component.html',
  styleUrls: ['./ha-public-sidenav.component.scss']
})
export class HaPublicSidenavComponent implements OnInit {

  isConnected = false;
  brickId: string;
  currentDocUrl: string = null;

  docContextMenuConfig: FlContextMenuConfig;

  private _transformer = (node: HaNode, level: number): any => {
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

  dataSource = new HaMateTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private brickService: HaBrickService,
    private authService: HaAuthService,
    private route: ActivatedRoute,
    private contextMenuService: FlContextMenuService,
    private documentationService: HaDocumentationService,
    private folderService: HaFolderService,
    private dialogService: FlDialogService,
  ) {
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnInit(): void {
    this.isConnected = this.authService.hasAuthorizationCookie();

    this.route.parent.url.subscribe(url => {
      this.brickService.getByName(url[0].path).subscribe(brick => {
        this.brickId = brick.id;

        this.brickService.getBrickDocs(this.brickId).subscribe((data) => {
          this.dataSource.data = data.children;
        });
      });
    });
  }

  changeCurrentDoc(completeUrl: string): void {
    this.currentDocUrl = completeUrl;
  }

  onRightClick(event: MouseEvent, isFolder: boolean, id?: string): void {
    event.preventDefault();
    event.stopPropagation();
    let element: HTMLElement = event.target as any;
    if(!id){
      this.brickService.getRootFolderId(this.brickId).subscribe(res => {
        console.log(res.id);
        this.contextMenuService.openContextMenu(this.getContextMenuConfig(isFolder, res.id), element);
      });
    } else {
      console.log(id);
      this.contextMenuService.openContextMenu(this.getContextMenuConfig(isFolder, id), element);
    }

  }

  private openResourceEditDoc(id: string): void {
    console.log('edit doc');
  }

  private openResourceEditFolder(id: string): void {
    console.log('edit folder');
  }

  private getContextMenuConfig(isFolder: boolean, id?: string): FlContextMenuConfig {
    if (isFolder) {
      return {
        buttons: [
          {
            text: {text: 'create', translateText: true},
            icon: 'add',
            onClick: () => this.openCreateDialog(id)
          },
          {
            text: {text: 'edit', translateText: true},
            icon: 'edit',
            onClick: () => this.preparEditDialog(id, isFolder)
          },
          {
            text: {text: 'delete', translateText: true},
            icon: 'delete',
            onClick: () => this.openResourceDelete(id, isFolder),
          },
        ]
      };
    }
    return {
      buttons: [
        {
          text: {text: 'edit', translateText: true},
          icon: 'edit',
          onClick: () => this.preparEditDialog(id, isFolder)
        },
        {
          text: {text: 'delete', translateText: true},
          icon: 'delete',
          onClick: () => this.openResourceDelete(id, isFolder)
        },
      ]
    };
  }

  openResourceDelete(id: string, isFolder: boolean): void {
    const input: FlConfirmDialogInput = {
      title: 'confirm_deletion',
      content: 'confirm_deletion_message',
      translateTitleAndContent: true,
      observable: isFolder ? this.folderService.deleteById(id) : this.documentationService.deleteById(id),
      successMessage: isFolder ? 'folder_deleted' : 'documentation_deleted',
      translateMessage: true
    }

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(res => {
      this.onCloseConfirmDialog(res);
    })
  }

  private onCloseConfirmDialog(res: FlConfirmDialogResult): void {
    if (res.choice) {
      this.brickService.getBrickDocs(this.brickId).subscribe((data) => {
        this.dataSource.data = data.children;
      });
    }
  }

  private openCreateDialog(folderId: string): void {
    const input: FlFormDialogInput<HaNodeDTO> = {
      mode: 'create',
      object: {
        id: null,
        path: null,
        title: null,
        isFolder: null,
        folderId: folderId
      } as HaNodeDTO
    };
    this.dialogService.openSmallDialog(HaPublicSidenavCreateFormDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaNodeDTO) => {
        if (res != null) {
          this.brickService.getBrickDocs(this.brickId).subscribe((data) => {
            this.dataSource.data = data.children;
          });
        }
      }
    );
  }

  private preparEditDialog(id: string, isFolder: boolean): void {
    if(isFolder){
      this.folderService.getById(id).subscribe(f => {
        this.createEditDialog(isFolder, f);
      });
    } else {
      this.documentationService.getById(id).subscribe(d => {
        this.createEditDialog(isFolder, d);
      });
    }
  }

  private createEditDialog(isFolder: boolean, object: HaFolder | HaDocumentation){
    let node: HaNodeDTO = new HaNodeDTO();
    node.id = object.id;
    node.path = object.path;
    node.isFolder = isFolder;
    node.title = object.title;

    const input: FlFormDialogInput<HaNodeDTO> = {
      mode: 'update',
      object: node
    };

    this.dialogService.openSmallDialog(HaPublicSidenavCreateFormDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaNodeDTO) => {
        if (res != null) {
          this.brickService.getBrickDocs(this.brickId).subscribe((data) => {
            this.dataSource.data = data.children;
          });
        }
      }
    );
  }
}

