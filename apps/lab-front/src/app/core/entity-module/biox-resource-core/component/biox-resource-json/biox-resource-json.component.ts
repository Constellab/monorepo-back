import {Component, Input, OnInit} from '@angular/core';
import {BioxResourceViewComponent} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewJson} from '../../../../model/entities/resource/biox-resource-view.entity';

/**
 * Display the resource json
 */
@Component({
  selector: 'gen-biox-resource-json',
  templateUrl: './biox-resource-json.component.html',
  styleUrls: ['./biox-resource-json.component.scss']
})
export class BioxResourceJsonComponent implements OnInit, BioxResourceViewComponent<BioxResourceViewJson> {

  @Input() view: BioxResourceViewJson;

  constructor() {
  }

  ngOnInit(): void {
  }

}
