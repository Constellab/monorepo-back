/* eslint-disable @typescript-eslint/member-ordering */
import {Component, Input, OnInit} from '@angular/core';
import {HaAuthService} from '../../../../../ha-core/ha-service/ha-auth.service';
import {HaMateTreeFlatDataSource, HaNode} from '../../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {HaFolderService} from '../../../../../ha-core/ha-service/ha-folder.service';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';


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
    private daBrickService: HaBrickService,
    private daAuthService: HaAuthService,
    private route: ActivatedRoute,
  ) {
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnInit(): void {
    this.isConnected = this.daAuthService.hasAuthorizationCookie();

    this.route.parent.url.subscribe(url=>{
      this.daBrickService.getByName(url[0].path).subscribe(brick => {
        this.brickId = brick.id;
      });
    });



    this.daBrickService.getBrickDocs(this.brickId).subscribe((data) => {
      this.dataSource.data = data.children;
    });

  }

  changeCurrentDoc(completeUrl: string): void{
    this.currentDocUrl = completeUrl;
  }

  onRightClick($event: MouseEvent): void {
    $event.preventDefault();
  }
}
