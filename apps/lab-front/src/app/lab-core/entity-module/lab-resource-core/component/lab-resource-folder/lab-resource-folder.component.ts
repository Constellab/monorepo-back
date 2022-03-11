import {Component, OnInit} from '@angular/core';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {
  LabResourceViewFolder,
  LabResourceViewFolderContent,
  LabResourceViewFolderContentFlat
} from '../../../../model/entities/resource/lab-resource-view-folder.class';
import {FlFlatTreeControl} from '@monorepo/front-core-lib';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {ActivatedRoute} from '@angular/router';
import {first} from 'rxjs/operators';

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
              private route: ActivatedRoute) {
    super();
  }

  private _transformer = (node: LabResourceViewFolderContent, level: number): LabResourceViewFolderContentFlat => {
    return {
      name: node.name,
      resource_model_id: node.resource_model_id,
      expandable: !!node.children && node.children.length > 0,
      level: level,
    };
  };

  hasChild = (_: number, node: LabResourceViewFolderContentFlat): boolean => node.expandable;

  ngOnInit(): void {
    this.treeControl = new FlFlatTreeControl<LabResourceViewFolderContentFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<LabResourceViewFolderContent, LabResourceViewFolderContentFlat> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = this.view.data.content.children;
  }

  extractNode(node: LabResourceViewFolderContentFlat): void {
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

    // todo ne pas utilise le route
    this.route.params.pipe(first()).subscribe(
      params => {
        this.fileService.extractFile(params.id, path).subscribe({
          next: result => console.log(result),
        });
      }
    );

  }

}
