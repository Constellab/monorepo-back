import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {FlFlatTreeControl, FlFormFieldDirective} from '@monorepo/front-core-lib';
import {LabProject, LabProjectWithChildren} from '../../../../model/entities/lab-project.class';
import {NgControl} from '@angular/forms';
import {LabProjectService} from '../../../../entity-service/lab-project.service';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';


interface LabProjectFlatNode {
  project: LabProject;
  level: number;
  expandable: boolean;
  selected: boolean;
}

@Component({
  selector: 'lab-project-select',
  templateUrl: './lab-project-select.component.html',
  styleUrls: ['./lab-project-select.component.scss']
})
export class LabProjectSelectComponent extends FlFormFieldDirective<FlFlatTreeControl<LabProjectFlatNode, string>, LabProject[]>
  implements OnInit {

  @Output() selectionChange: EventEmitter<LabProject[]> = new EventEmitter();

  dataSource: MatTreeFlatDataSource<LabProjectWithChildren, LabProjectFlatNode>;

  isLoading: boolean = false;

  // use to store the selected project before the project list is loaded
  private tempSelectedProjects: LabProject[] = [];

  private _transformer = (node: LabProjectWithChildren, level: number): LabProjectFlatNode => {
    return {
      project: node,
      expandable: !!node.children && node.children.length > 0,
      level: level,
      selected: false
    };
  };

  hasChild = (_: number, node: LabProjectFlatNode): boolean => node.expandable;


  constructor(@Optional() @Self() ngControl: NgControl,
              private projectService: LabProjectService) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.projectService.getProjectTrees().subscribe({
      next: projects => this.getProjectTreesSuccess(projects),
      error: () => this.isLoading = false
    });
  }

  private getProjectTreesSuccess(projects: LabProjectWithChildren[]): void {
    this.value = new FlFlatTreeControl<LabProjectFlatNode, string>(
      node => node.level, node => node.expandable, {
        trackBy: node => node.project.id
      });

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<LabProjectWithChildren, LabProjectFlatNode, string> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable,
      node => node.children);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.value, treeFlattener, projects);

    if (this.tempSelectedProjects?.length > 0) {
      this.selectProjects(this.tempSelectedProjects);
    }

    this.isLoading = false;
  }

  callChangeEvent(value: LabProject[]): void {
    this.selectionChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: LabProject[]): void {
    this.selectProjects(obj);
  }

  private selectProjects(projects: LabProject[]): void {
    if (this.value) {
      const nodes = this.value.dataNodes.filter(node => projects.find(project => project.id === node.project.id) != null);
      for (const node of nodes) {
        this.value.expandAncestors(node);
        node.selected = true;
      }
    }
    this.tempSelectedProjects = projects;
  }


  protected convertInnerToOuter(innerValue: FlFlatTreeControl<LabProjectFlatNode, string>): LabProject[] {
    return innerValue.dataNodes.filter(node => node.selected).map(node => node.project);
  }

  toggleProjectSelection(project: LabProjectFlatNode): void {
    if (this.disabled) return;

    project.selected = !project.selected;
    this.emitCurrentValue();
  }


}
