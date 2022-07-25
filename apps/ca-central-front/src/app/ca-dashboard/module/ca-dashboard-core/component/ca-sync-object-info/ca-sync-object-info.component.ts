import {Component, Input, OnInit} from '@angular/core';
import {CaProjectObject} from '../../../../../ca-core/model/entities/ca-project.class';

/**
 * Component to show information about the sync of a project object
 */
@Component({
  selector: 'ca-sync-object-info',
  templateUrl: './ca-sync-object-info.component.html',
  styleUrls: ['./ca-sync-object-info.component.scss']
})
export class CaSyncObjectInfoComponent implements OnInit {

  @Input() object: CaProjectObject;

  constructor() {
  }

  ngOnInit(): void {
  }

}
