import {Component, Input, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaProjectObjectRef, CaProjectTreeDto} from '../../../../../ca-core/model/entities/ca-project.class';
import {first, Observable, switchMap} from 'rxjs';
import {FlFlatTreeControl} from '@monorepo/front-core-lib';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface CaProjectFlatNode {
  id: string;
  title: string;
  level: number;
  expandable: boolean;
}

/**
 * Display the tree from the root project of an object
 */
@Component({
  selector: 'ca-project-object-tree',
  templateUrl: './ca-project-object-tree.component.html',
  styleUrls: ['./ca-project-object-tree.component.scss']
})
export class CaProjectObjectTreeComponent implements OnInit {

  @Input() projectObject$: Observable<CaProjectObjectRef>;

  rootProject: CaProjectTreeDto;
  treeControl: FlFlatTreeControl<CaProjectFlatNode, string>;
  dataSource: MatTreeFlatDataSource<CaProjectTreeDto, CaProjectFlatNode>;

  isLoading: boolean = false;

  private _transformer = (node: CaProjectTreeDto, level: number): CaProjectFlatNode => {
    return {
      id: node.id,
      expandable: !!node.children && node.children.length > 0,
      level: level,
      title: node.title,
    };
  };

  hasChild = (_: number, node: CaProjectFlatNode): boolean => node.expandable;

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.projectObject$.pipe(
      // as the tree start with the root, it only needs to be loaded once
      first(),
      switchMap(projectObject => this.projectService.getProjectTree(projectObject.type, projectObject.id))
    ).subscribe({
      next: projectTree => this.constructTree(projectTree),
      error: () => this.isLoading = false
    });
  }


  private constructTree(projectTree: CaProjectTreeDto): void {
    this.rootProject = projectTree;
    this.treeControl = new FlFlatTreeControl<CaProjectFlatNode, string>(
      node => node.level, node => node.expandable, {
        trackBy: node => node.id
      });

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<CaProjectTreeDto, CaProjectFlatNode, string> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable,
      node => node.children);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener, projectTree.children);

    this.isLoading = false;
  }
}
