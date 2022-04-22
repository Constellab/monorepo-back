import {Component, OnInit} from '@angular/core';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewJson} from '../../model/rv-resource-view.class';

/**
 * Display the resource json
 */
@Component({
  selector: 'rv-view-json',
  templateUrl: './rv-view-json.component.html',
  styleUrls: ['./rv-view-json.component.scss']
})
export class RvViewJsonComponent extends RvResourceViewDirective<RvResourceViewJson> implements OnInit {


  ngOnInit(): void {
  }

}
