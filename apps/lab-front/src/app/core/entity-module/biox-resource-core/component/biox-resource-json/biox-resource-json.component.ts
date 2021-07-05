import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';

/**
 * Display the resource json
 */
@Component({
  selector: 'gen-biox-resource-json',
  templateUrl: './biox-resource-json.component.html',
  styleUrls: ['./biox-resource-json.component.scss']
})
export class BioxResourceJsonComponent implements OnInit {

  @Input() resource: BioxResource;

  constructor() {
  }

  ngOnInit(): void {
  }

}
