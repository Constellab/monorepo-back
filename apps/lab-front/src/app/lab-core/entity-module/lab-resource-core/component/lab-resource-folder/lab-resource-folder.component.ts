import {Component, OnInit} from '@angular/core';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {
  LabResourceViewFolder,
  LabResourceViewFolderContent,
  LabResourceViewFolderContentFlat
} from '../../../../model/entities/resource/lab-resource-view-folder.class';
import {FlDialogService, FlFlatTreeControl, FlMenuDynamic, FlMenuDynamicService} from '@monorepo/front-core-lib';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {ActivatedRoute} from '@angular/router';
import {first, mergeMap} from 'rxjs/operators';
import {
  LabFsNodeTypesSelectionDialogComponent,
  LabFsNodeTypesSelectionDialogInput,
  LabFsNodeTypesSelectionDialogResult
} from '../lab-fs-node-types-selection-dialog/lab-fs-node-types-selection-dialog.component';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabRouterService} from '../../../../service/lab-router.service';

/**
 * Resource view for folder
 */
@Component({
  selector: 'lab-resource-folder',
  templateUrl: './lab-resource-folder.component.html',
  styleUrls: ['./lab-resource-folder.component.scss']
})
export class LabResourceFolderComponent extends LabResourceViewDirective<LabResourceViewFolder> implements OnInit {

  treeControl: FlFlatTreeControl<LabResourceViewFolderContentFlat>;

  dataSource: MatTreeFlatDataSource<LabResourceViewFolderContent, LabResourceViewFolderContentFlat>;

  constructor(private fileService: LabFileResourceService,
              private route: ActivatedRoute,
              private dialogService: FlDialogService,
              private routerService: LabRouterService,
              private menuDynamicService: FlMenuDynamicService) {
    super();
  }

  private _transformer = (node: LabResourceViewFolderContent, level: number): LabResourceViewFolderContentFlat => {
    return {
      name: node.name,
      resource_model_id: node.resource_model_id,
      isFolder: !!node.children && node.children.length > 0,
      level: level,
      isLoading: false
    };
  };

  hasChild = (_: number, node: LabResourceViewFolderContentFlat): boolean => node.isFolder;

  ngOnInit(): void {
    this.treeControl = new FlFlatTreeControl<LabResourceViewFolderContentFlat>(
      node => node.level, node => node.isFolder);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<LabResourceViewFolderContent, LabResourceViewFolderContentFlat> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.isFolder, node => node.children);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = this.view.data.content.children;
  }


  // open the dialog to select the node type
  extractNode(node: LabResourceViewFolderContentFlat): void {
    const input: LabFsNodeTypesSelectionDialogInput = {
      dialogMode: node.isFolder ? 'folder' : 'files',
      filenames: [node.name]
    };

    this.dialogService.openSmallDialog(LabFsNodeTypesSelectionDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.selectNodeTypeClosed(result, node)
    );
  }


  private selectNodeTypeClosed(result: LabFsNodeTypesSelectionDialogResult, node: LabResourceViewFolderContentFlat): void {
    if (result == null) return;

    const path: string = this.getNodePath(node);
    const typingName = result.uploadMode === 'files' ? result.fileTypingNames[0] : result.folderTypingName;

    node.isLoading = true;
    this.route.params.pipe(
      first(),
      mergeMap(params => this.fileService.extractFile(params.id, path, typingName))).subscribe({
      next: resource => this.extractFileSuccess(node, resource),
      error: () => node.isLoading = false
    });
  }

  private extractFileSuccess(node: LabResourceViewFolderContentFlat, resource: LabResource): void {
    node.isLoading = false;
    node.resource_model_id = resource.id;
    this.routerService.navigateToResourceDetail(resource.id);
  }


  // retrieve the node full path by calling ancestors
  private getNodePath(node: LabResourceViewFolderContentFlat): string {
    let path: string = null;
    let currentNode: LabResourceViewFolderContentFlat = node;
    while (currentNode) {
      if (path == null) {
        path = currentNode.name;
      } else {
        path = currentNode.name + '/' + path;
      }
      currentNode = this.treeControl.getAncestor(currentNode);
    }
    return path;
  }

  // use to open menu on right click
  openMenu(node: LabResourceViewFolderContentFlat, event: MouseEvent): void {
    event.preventDefault();

    const menuDynamic: FlMenuDynamic[] = [];
    if (node.resource_model_id) {
      menuDynamic.push({
        type: 'link',
        text: {text: 'biox.view_resource', translateText: true},
        link: LabRouterService.getResourceDetailRoute(node.resource_model_id),
        icon: 'visibility',
      });
    } else {
      // button to extract the node
      menuDynamic.push({
        type: 'button',
        text: {
          text: node.isFolder ? 'biox.folder_extract_folder' : 'biox.folder_extract_file',
          translateText: true
        },
        onClick: () => this.extractNode(node)
      });

    }


    this.menuDynamicService.openDynamicMenuFromMouseEvent(menuDynamic, event);
  }

}
