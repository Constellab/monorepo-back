/* eslint-disable @typescript-eslint/member-ordering */
import {Component, OnInit} from '@angular/core';
import {DaAuthService} from '../../../da-core/da-service/da-auth.service';
import {DaMateTreeFlatDataSource, DaNode} from '../../../da-core/da-model/da-entities/da-node.class';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {DaFolderService} from '../../../da-core/da-service/da-folder.service';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
}

@Component({
  selector: 'da-public-sidenav',
  templateUrl: './da-public-sidenav.component.html',
  styleUrls: ['./da-public-sidenav.component.scss']
})
export class DaPublicSidenavComponent implements OnInit {

  isConnected = false;

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
    private daFolderService: DaFolderService,
    private daAuthService: DaAuthService
  ) {
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnInit(): void {

    this.isConnected = this.daAuthService.hasAuthorizationCookie();

    this.daFolderService.getTree().subscribe((data) => {
      this.dataSource.data = data.children;
    });
  }

}
