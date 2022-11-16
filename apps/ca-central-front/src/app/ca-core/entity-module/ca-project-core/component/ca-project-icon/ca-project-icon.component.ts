import {Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';

/**
 * Icon for a project if it is a parent or a leaf project
 */
@Component({
  selector: 'ca-project-icon',
  templateUrl: './ca-project-icon.component.html',
  styleUrls: ['./ca-project-icon.component.scss']
})
export class CaProjectIconComponent implements OnInit {

  @Input() type: 'parent' | 'leaf';

  @Input() project: CaProject;

  @Input() iconClass: string = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  get projectType(): 'parent' | 'leaf' {
    return this.type ?? (this.project.isLeaf() ? 'leaf' : 'parent');
  }

  get projectIcon(): string {
    return this.projectType === 'leaf' ? 'project' : 'folder';
  }

  get backgroundClass(): string{
    return this.projectType === 'leaf' ? 'g-warn-background' : 'g-accent-background';
  }

}
