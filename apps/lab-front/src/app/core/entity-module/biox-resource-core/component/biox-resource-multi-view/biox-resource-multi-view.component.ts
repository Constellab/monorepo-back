import {Component, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewMulti} from '../../../../model/entities/resource/biox-resource-view.entity';

@Component({
  selector: 'gen-biox-resource-multi-view',
  templateUrl: './biox-resource-multi-view.component.html',
  styleUrls: ['./biox-resource-multi-view.component.scss']
})
export class BioxResourceMultiViewComponent extends BioxResourceViewDirective<BioxResourceViewMulti>
  implements OnInit {


  ngOnInit(): void {
  }

}
