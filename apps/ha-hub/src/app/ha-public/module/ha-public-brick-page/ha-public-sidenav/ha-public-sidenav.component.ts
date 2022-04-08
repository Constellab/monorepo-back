/* eslint-disable @typescript-eslint/member-ordering */
import {Component, OnInit} from '@angular/core';
import {HaMateTreeFlatDataSource, HaNode, HaNodeDTO} from '../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput,
  FlMenuDynamic,
  FlMenuDynamicService,
  FlOverlayRef
} from '@monorepo/front-core-lib';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaFolder} from '../../../../ha-core/ha-model/ha-entities/ha-folder.class';
import {
  HaPublicSidenavCreateFormDialogComponent
} from '../ha-public-sidenav-create-form-dialog/ha-public-sidenav-create-form-dialog.component';
import {HaDocumentation} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
  completePath?: string;
}

@Component({
  selector: 'ha-public-sidenav',
  templateUrl: './ha-public-sidenav.component.html',
  styleUrls: ['./ha-public-sidenav.component.scss']
})
export class HaPublicSidenavComponent implements OnInit {

  isAdmin: Observable<boolean> = this.authUserService.isAdmin();
  brickId: string;
  brickName: string;
  brickVersion: string;
  overNodeLevel: number = 0;
  currentNode: HaNode;
  menuOpen: boolean;
  openedMenu: FlOverlayRef;

  srcResult: any;

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
  technicalDataSource = new HaMateTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private brickService: HaBrickService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute,
    private contextMenuService: FlMenuDynamicService,
    private documentationService: HaDocumentationService,
    private folderService: HaFolderService,
    private dialogService: FlDialogService,
  ) {
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  // expansion model tracks expansion state
  mainFolderId: string;
  expansionModel = new SelectionModel<FlatNode>(true);
  previousData: HaNode[];
  changedData: HaNode[];
  dragging = false;
  expandDelay = 1000;

  ngOnInit(): void {

    this.route.parent.url.subscribe(url => {
      this.brickService.getByName(url[0].path).subscribe(brick => {
        this.brickId = brick.id;
        this.brickName = brick.name
        this.brickVersion = url[1].path;

        this.brickService.getTechnicalDocumentation(this.brickId, this.brickVersion).subscribe(data => {
          this.technicalDataSource.data = [data];
        });

        this.brickService.getBrickDocs(this.brickId, this.brickVersion).subscribe((data) => {
          this.dataSource.data = data.children;

          if (this.dataSource.data.length > 0) {
            this.mainFolderId = this.dataSource.data[0].parentId;
            this.openFolderToCurrentNode();
          }
        });
      });
    });
  }

  isNotEmpty(node: FlatNode): boolean {
    const n: HaNode = this.dataSource.data.find(n => n.id == node.id);
    return n.children != null && n.children.length > 0;
  }

  onRightClick(event: MouseEvent, isFolder: boolean, hasChild: boolean = false, id?: string): void {
    this.isAdmin.subscribe(isAdmin => {
      if (isAdmin) {
        event.preventDefault();
        event.stopPropagation();
        if (this.menuOpen) {
          this.openedMenu.overlayRef.detach();
        }
        if (!id) {
          this.brickService.getRootFolderId(this.brickId, this.brickVersion).subscribe(res => {
            this.openedMenu =
              this.contextMenuService.openDynamicMenuFromMouseEvent(this.getContextMenuConfig(isFolder, res.id, true), event);
          });
        } else {
          this.openedMenu =
            this.contextMenuService.openDynamicMenuFromMouseEvent(this.getContextMenuConfig(isFolder, id, false, hasChild), event);
        }
        this.menuOpen = true;
      }
    });
  }

  private getContextMenuConfig(isFolder: boolean, id?: string, isRoot: boolean = false, hasChild: boolean = false): FlMenuDynamic[] {
    if (isFolder) {
      return isRoot ? [
        {
          type: 'button',
          text: {text: 'create', translateText: true},
          icon: 'add',
          onClick: () => {
            this.openCreateDialog(id);
          }
        }
      ] : [
        {
          type: 'button',
          text: {text: 'create', translateText: true},
          icon: 'add',
          onClick: (event) => this.openCreateDialog(id)
        },
        {
          type: 'button',
          text: {text: 'edit', translateText: true},
          icon: 'edit',
          onClick: (event) => this.prepareEditDialog(id, isFolder)
        },
        {
          type: 'button',
          text: {text: 'delete', translateText: true},
          icon: 'delete',
          onClick: (event) => this.openResourceDelete(id, isFolder),
          disabled: hasChild
        }
      ];
    }
    return [
      {
        type: 'button',
        text: {text: 'edit', translateText: true},
        icon: 'edit',
        onClick: (event) => this.prepareEditDialog(id, isFolder)
      },
      {
        type: 'button',
        text: {text: 'delete', translateText: true},
        icon: 'delete',
        onClick: (event) => this.openResourceDelete(id, isFolder)
      }
    ];
  }

  openResourceDelete(id: string, isFolder: boolean): void {
    const input: FlConfirmDialogInput = {
      title: 'confirm_deletion',
      content: 'confirm_deletion_message',
      translateTitleAndContent: true,
      observable: isFolder ? this.folderService.deleteById(id) : this.documentationService.deleteById(id),
      successMessage: isFolder ? 'folder_deleted' : 'documentation_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(res => {
      this.onCloseConfirmDialog(res);
    });
  }

  private onCloseConfirmDialog(res: FlConfirmDialogResult): void {
    if (res.choice) {
      this.brickService.getBrickDocs(this.brickId, this.brickVersion).subscribe((data) => {
        this.rebuildTreeForData(data.children);
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

    this.openSmallDialog(input);
  }

  private openSmallDialog(input: any): void {
    this.dialogService.openSmallDialog(HaPublicSidenavCreateFormDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaNodeDTO) => {
        if (res != null) {
          this.brickService.getBrickDocs(this.brickId, this.brickVersion).subscribe((data) => {
            this.rebuildTreeForData(data.children);
          });
        }
      }
    );
  }

  private prepareEditDialog(id: string, isFolder: boolean): void {
    if (isFolder) {
      this.folderService.getById(id).subscribe(f => {
        this.createEditDialog(isFolder, f);
      });
    } else {
      this.documentationService.getById(id).subscribe(d => {
        this.createEditDialog(isFolder, d);
      });
    }
  }

  private createEditDialog(isFolder: boolean, object: HaFolder | HaDocumentation): void {
    const node: HaNodeDTO = new HaNodeDTO();
    node.id = object.id;
    node.path = object.path;
    node.isFolder = isFolder;
    node.title = object.title;

    const input: FlFormDialogInput<HaNodeDTO> = {
      mode: 'update',
      object: node
    };

    this.openSmallDialog(input);
  }

  addExpandedChildren(node: HaNode, expanded: FlatNode[], result: HaNode[]): HaNode[] {
    result.push(node);
    const n: FlatNode = this.treeControl.dataNodes.find(n => n.id == node.id);
    if (node.children && this.treeControl.isExpanded(n)) {
      node.children.map((child) => this.addExpandedChildren(child, expanded, result));
    }
    return result;
  }

  visibleNodes(): HaNode[] {
    let result: HaNode[] = [];

    this.dataSource.data.forEach((node) => {
      result = this.addExpandedChildren(node, this.expansionModel.selected, result);
    });
    return result;
  }

  // recursive find function to find siblings of node
  findNodeSiblings(arr: HaNode[], node: HaNode): HaNode[] {
    let result, subResult;
    arr.forEach((item, i) => {
      if (item.id === node.id) {
        result = arr;
      } else if (item.children) {
        subResult = this.findNodeSiblings(item.children, node);
        if (subResult) result = subResult;
      }
    });
    return result;

  }

  drop($event: CdkDragDrop<HaNode[]>): void {

    // ignore drops outside of the tree
    if (!$event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();


    // deep clone the data source so we can mutate it
    this.changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // determine where to insert the node
    const nodeAtDest = visibleNodes[$event.currentIndex];
    const newSiblings = this.findNodeSiblings(this.changedData, nodeAtDest);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // remove the node from its old place
    const node = $event.item.data;
    const siblings = this.findNodeSiblings(this.changedData, node);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert: HaNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // insert node
    newSiblings.splice(insertIndex, 0, nodeToInsert);

    //this.changedData = this.updateEmptyNodes(this.changedData);
    // rebuild tree with mutated data
    this.rebuildTreeForData(this.changedData);
    this.saveTreeData(this.changedData);
  }


  saveTreeData(nodes: HaNode[]): void {
    nodes = this.updatedTree(nodes, 0);
    this.folderService.updateTree(nodes).subscribe();
  }

  updatedTree(nodes: HaNode[], levelTheo: number): HaNode[] {
    nodes.forEach(n => {
      const newIndex: number = nodes.findIndex(node => node.id == n.id);
      n.order = n.order != newIndex ? newIndex : n.order;

      const nf: FlatNode = this.treeControl.dataNodes.find(value => value.id == n.id);
      n.parentId = this.getParentId(nf);

      if (n.children) {
        if (n.children.length == 1 && n.children[0].id == null) {
          n.children.splice(0);
        } else {
          n.children = this.updatedTree(n.children, levelTheo + 1);
        }
      }
    });
    return nodes;
  }

  getParentId(node: FlatNode): string {
    const currentLevel = node.level;

    if (currentLevel == 0) {
      return this.mainFolderId;
    }

    const parentIndex = currentLevel - 1;
    const parent: FlatNode = this.treeControl.dataNodes
      .find(p => p.level == parentIndex && this.treeControl.getDescendants(p).includes(node));
    return parent.id;
  }

  openFolderToCurrentNode(): void {
    this.route.children[0].url.subscribe(url => {
      this.expandParents(this.treeControl.dataNodes.find((dn) => dn.completePath == (url.toString().replace(',', '/') + '/')));
    })

  }

  expandParents(node: FlatNode): void {
    if(node != null && node.level != null){
      const currentLevel = this.treeControl.getLevel(node);

      if (currentLevel < 1) {
        return null;
      }

      const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

      for (let i = startIndex; i >= 0; i--) {
        const currentNode = this.treeControl.dataNodes[i];

        if (this.treeControl.getLevel(currentNode) < currentLevel) {
          this.treeControl.expand(currentNode);
          if (this.treeControl.getLevel(currentNode) === 0) break;
        }
      }
    }
  }


  dragHover(node: FlatNode): void {
    if (this.dragging) {
      this.overNodeLevel = node.level;
    }
  }

  dragHoverEnd(): void {

  }

  dragStart($event?: CdkDragStart<FlatNode>): void {
    this.dragging = true;
    this.previousData = this.dataSource.data;
    if ($event) {
      const node: FlatNode = $event.source.data;
      if (this.treeControl.isExpanded(node)) {
        this.treeControl.collapse(node);
      }
    }
  }

  dragEnd(): void {
    this.dragging = false;
  }

  rebuildTreeForData(data: HaNode[]): void {
    this.dataSource.data = data;
    this.expansionModel.selected.forEach((node) => {
      const n = this.treeControl.dataNodes.find((n) => n.id == node.id);
      this.treeControl.expand(n);
    });
  }

  openImportTechDocDialog(): void{

  }

  onFileSelected($event: any):void {

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.srcResult = JSON.parse(e.target.result);

        this.brickService.importTechnicalDocumentation({
          brickName: this.brickName,
          importFile: this.srcResult
        }).subscribe();
      };

      reader.readAsText($event.target.files[0]);
    }
  }
}

