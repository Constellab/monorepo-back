import {Component, Input, OnInit} from '@angular/core';
import {CaProjectObject} from '../../../../../ca-core/model/entities/ca-project.class';

/**
 * Simple component to show information about the validation of a project object
 */
@Component({
  selector: 'ca-validated-object-info',
  templateUrl: './ca-validated-object-info.component.html',
  styleUrls: ['./ca-validated-object-info.component.scss']
})
export class CaValidatedObjectInfoComponent implements OnInit {

  @Input() object: CaProjectObject;

  constructor() { }

  ngOnInit(): void {
  }

}
