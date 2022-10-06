/* eslint-disable @typescript-eslint/member-ordering */
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
  HaMateTreeFlatDataSource,
  HaNode,
  HaNodeDTO,
  HaNodeType
} from '../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
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
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {SelectionModel} from '@angular/cdk/collections';
import {Observable, of, startWith, Subscription, tap} from 'rxjs';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {FormControl} from '@ngneat/reactive-forms';
import {ClStringHelper} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {HaPublicDocComponent} from '../ha-public-doc/ha-public-doc.component';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
  completePath?: string;
  path?: string;
}

@Component({
  selector: 'ha-public-sidenav',
  templateUrl: './ha-public-sidenav.component.html',
  styleUrls: ['./ha-public-sidenav.component.scss']
})
export class HaPublicSidenavComponent implements OnInit {
  searchTechDocControl = new FormControl<string>('');
  isAdmin: Observable<boolean> = this.authUserService.isAdmin();
  brickId: string;
  brickName: string;
  brickVersion: string;
  overNodeLevel: number = 0;
  currentNode: FlatNode;
  menuOpen: boolean;
  openedMenu: FlOverlayRef;

  trackByIdentity = (index: number, item: any): any => item;

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
  dataSource$: Observable<HaMateTreeFlatDataSource<HaNode, any, any>>;
  technicalDataSource = new HaMateTreeFlatDataSource(this.treeControl, this.treeFlattener);
  technicalDataSource$: Observable<HaMateTreeFlatDataSource<HaNode, any, any>>;
  technicalDocResources: HaNode[];
  technicalDocTasks: HaNode[];
  technicalDocProtocols: HaNode[];

  private mediaSubscription!: Subscription;
  isSmallScreen: boolean = false;
  sideNavIsOpen: boolean = false;
  activatedRoute: ActivatedRoute = this.route;

  constructor(
    private brickService: HaBrickService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute,
    private router: Router,
    private contextMenuService: FlMenuDynamicService,
    private documentationService: HaDocumentationService,
    private folderService: HaFolderService,
    private dialogService: FlDialogService,
    public mediaObserver: MediaObserver,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  // expansion model tracks expansion state
  mainFolderId: string;
  expansionModel = new SelectionModel<FlatNode>(true);
  changedData: HaNode[];
  dragging = false;
  hoverId: string;

  ngOnInit(): void {

    this.mediaSubscription = this.mediaObserver
      .asObservable()
      .pipe()
      .subscribe((change) => {
        this.setIsSmallScreen(change);
      });


    this.route.params.subscribe(params => {
      this.brickService.getByName(params['brickName']).subscribe(brick => {
        this.brickId = brick.id;
        this.brickName = brick.name
        this.brickVersion = params['version'];

        this.getTechnicalDocumentations();
        this.getDocumentations();
      });
    });
  }

  private getTechnicalDocumentations(): void{
    this.brickService.getTechnicalDocumentation(this.brickId, this.brickVersion).subscribe(data => {
      if (data) {
        this.technicalDataSource.data = [data];
        this.technicalDataSource$ = of(this.technicalDataSource);
        this.technicalDocResources = data.children[0].children;
        this.technicalDocTasks = data.children[1].children;
        this.technicalDocProtocols = data.children[2].children;
        this.updateTechDataSource();
      }
    });
  }

  private getDocumentations(): void{
    this.brickService.getBrickDocs(this.brickId, this.brickVersion).subscribe((data) => {
      this.rebuildTreeForData(data.children);
      if (this.dataSource.data.length > 0) {
        this.dataSource$ = of(this.dataSource);
        this.mainFolderId = this.dataSource.data[0].parentId;
        this.changeDetectorRefs.detectChanges();

        this.route.children[0].url.subscribe((cp) => {
          this.expandToOpenedDoc(cp);
        });
      }
    });
  }

  private expandToOpenedDoc(cp: UrlSegment[]): void{
    for(const dN of this.treeControl.dataNodes){
      if(dN.expandable && cp.find(c => c.path == dN.path)){
        this.treeControl.expand(dN);
      }
    }
  }

  setIsSmallScreen(mediaChanges: MediaChange[]): void {
    this.isSmallScreen = mediaChanges.find(m => m.mqAlias == 'lt-md') != null
  }



  onClickMenu(event: MouseEvent, isFolder: boolean, hasChild: boolean = false, id?: string): void {
    this.isAdmin.subscribe(isAdmin => {
      if (isAdmin) {
        event.preventDefault();
        event.stopPropagation();
        if (this.menuOpen) {
          this.openedMenu.overlayRef.detach();
        }
        if (!id) {
          this.brickService.getRootFolderId(this.brickId, this.brickVersion).subscribe(res => {
            this.openCreateDialog(res.id);
          });
        } else {
          this.openedMenu =
            this.contextMenuService.openDynamicMenuFromMouseEvent(this.getContextMenuConfig(isFolder, id, hasChild), event);
          this.menuOpen = true;
        }

      }
    });
  }

  private getContextMenuConfig(isFolder: boolean, id?: string, hasChild: boolean = false): FlMenuDynamic[] {
    if (isFolder) {
      return [
        {
          type: 'button',
          text: {text: 'create', translateText: true},
          icon: 'add',
          onClick: () => this.openCreateDialog(id)
        },
        {
          type: 'button',
          text: {text: 'edit_title', translateText: true},
          icon: 'edit',
          onClick: () => this.prepareEditDialog(id, isFolder)
        },
        {
          type: 'button',
          text: {text: 'delete', translateText: true},
          icon: 'delete',
          onClick: () => this.openResourceDelete(id, isFolder),
          disabled: hasChild
        }
      ];
    }
    return [
      {
        type: 'button',
        text: {text: 'edit_title', translateText: true},
        icon: 'edit',
        onClick: () => this.prepareEditDialog(id, isFolder)
      },
      {
        type: 'button',
        text: {text: 'delete', translateText: true},
        icon: 'delete',
        onClick: () => this.openResourceDelete(id, isFolder)
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
      (res) => {
        if (res != null) {
          if(res[1] == HaNodeType.TEC){
            this.brickService.importTechnicalDocumentation({
              brickName: this.brickName,
              importFile: res[0]
            }).subscribe(() => {
              this.getTechnicalDocumentations();
            });
          } else {
            this.getDocumentations();
          }
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
    arr.forEach((item) => {
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

    // ignore drops outside the tree
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
    this.saveTreeData(this.changedData, node);
  }


  saveTreeData(nodes: HaNode[], node: any): void {
    nodes = this.updatedTree(nodes, 0);
    this.folderService.updateTree(nodes).subscribe(() => {
      if (node.expandable) {
        this.folderService.update({id: node.id, title: node.name, isFolder: true}).subscribe();
      } else {
        this.documentationService.update({id: node.id, isFolder: false, title: node.name}).subscribe();
      }
    });
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

  rebuildTreeForData(data: HaNode[]): void {
    this.dataSource.data = data;
    this.expansionModel.selected.forEach((node) => {
      const n = this.treeControl.dataNodes.find((n) => n.id == node.id);
      this.treeControl.expand(n);
    });
  }

  closeSideNav(): void {
    this.sideNavIsOpen = false;
  }

  openSideNav(): void {
    if (this.isSmallScreen) {
      this.sideNavIsOpen = true;
    }
  }

  private updateTechDataSource(): void {
    this.technicalDataSource$ = this.searchTechDocControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value == '') {
          return this.technicalDataSource;
        }
        const techDataSourceData: HaNode[] = JSON.parse(JSON.stringify(this.technicalDataSource.data));
        techDataSourceData[0].children[0].children = this.technicalDocResources.filter(child =>
          ClStringHelper.stringContains(child.name, value, true, true, true));
        techDataSourceData[0].children[1].children = this.technicalDocTasks.filter(child =>
          ClStringHelper.stringContains(child.name, value, true, true, true));
        techDataSourceData[0].children[2].children = this.technicalDocProtocols.filter(child =>
          ClStringHelper.stringContains(child.name, value, true, true, true));

        const res: HaMateTreeFlatDataSource<HaNode, any, any> = new HaMateTreeFlatDataSource(this.treeControl, this.treeFlattener);
        const emptyFolder: HaNode[] = [];
        for (const n of techDataSourceData[0].children) {
          if (!n.children || n.children.length == 0) {
            emptyFolder.push(n);
          }
        }
        techDataSourceData[0].children = techDataSourceData[0].children.filter(v => !emptyFolder.includes(v));
        if (techDataSourceData[0].children.length == 0) {
          techDataSourceData.pop();
        }

        res.data = techDataSourceData;
        return res;
      }),
      tap(value => {
        if (this.searchTechDocControl.value.length > 0 && value.data && value.data[0]) {

          for (const folder of value.data[0].children) {
            if (folder.children.length > 0) {
              this.expandNode(folder);
            }
          }
          this.expandNode(value.data[0]);
        }
      })
    );
  }

  private expandNode(node: HaNode): void {
    this.treeControl.expand(this.treeControl.dataNodes.find(n => n.completePath === node.completePath));
  }



  componentAdded(event: HaPublicDocComponent): void{
    event.newItemEvent.subscribe(e => {
      if(e == 'rename'){
        this.getDocumentations();
      } else if(e == 'delete'){
        this.brickService.getBrickDocs(this.brickId, this.brickVersion).subscribe((data) => {
          this.rebuildTreeForData(data.children);
          this.router.navigate(['.'], {relativeTo: this.route})
        });
      }
    });
  }

}

