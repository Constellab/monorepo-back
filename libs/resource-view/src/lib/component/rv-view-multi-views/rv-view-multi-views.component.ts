import {Component, OnInit} from '@angular/core';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewMulti} from '../../model/rv-resource-view.class';

@Component({
  selector: 'rv-view-multi-views',
  templateUrl: './rv-view-multi-views.component.html',
  styleUrls: ['./rv-view-multi-views.component.scss']
})
export class RvViewMultiViewsComponent extends RvResourceViewDirective<RvResourceViewMulti>
  implements OnInit {


  ngOnInit(): void {
  }

}
