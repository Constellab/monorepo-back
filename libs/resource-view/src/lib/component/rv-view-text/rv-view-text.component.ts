import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewText} from '../../model/rv-resource-view.class';

/**
 * Component to view a resource as plain text
 *
 * Support pagination to previous or next page
 */
@Component({
  selector: 'rv-view-text',
  templateUrl: './rv-view-text.component.html',
  styleUrls: ['./rv-view-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RvViewTextComponent extends RvResourceViewDirective<RvResourceViewText> implements OnInit {

  @Input() view: RvResourceViewText;


  constructor() {
    super();
  }

  ngOnInit(): void {
  }
}
