import {Component, Input} from '@angular/core';
import {LabProject} from '../../../../model/entities/lab-project.class';

/**
 * Show project information in a compact way
 */
@Component({
  selector: 'lab-project-inline',
  templateUrl: './lab-project-inline.component.html',
  styleUrls: ['./lab-project-inline.component.scss']
})
export class LabProjectInlineComponent {

  @Input() project: LabProject;
}
