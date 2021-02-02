import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';

/**
 * Simple component to display information about a {@link BioxResource}
 */
@Component({
  selector: 'gen-biox-resource-info',
  templateUrl: './biox-resource-info.component.html',
  styleUrls: ['./biox-resource-info.component.scss']
})
export class BioxResourceInfoComponent implements OnInit {

  @Input() resource: BioxResource;

  constructor() {
  }

  ngOnInit(): void {
  }

}
