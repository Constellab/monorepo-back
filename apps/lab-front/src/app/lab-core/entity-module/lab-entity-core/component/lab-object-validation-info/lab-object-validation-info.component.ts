import {Component, Input, OnInit} from '@angular/core';
import {LabProjectObject} from '../../../../model/entities/lab-project.class';

/**
 * Simple component to show information about the validation of a project object
 */
@Component({
  selector: 'lab-object-validation-info',
  templateUrl: './lab-object-validation-info.component.html',
  styleUrls: ['./lab-object-validation-info.component.scss']
})
export class LabObjectValidationInfoComponent implements OnInit {

  @Input() object: LabProjectObject;

  constructor() {
  }

  ngOnInit(): void {
  }

}
