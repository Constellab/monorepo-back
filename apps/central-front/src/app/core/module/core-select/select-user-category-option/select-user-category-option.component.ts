import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {EmbeddedOptionsAbstractDirective} from '../../../abstract-directive/embedded-options-abstract.directive';
import {MatSelect} from '@angular/material/select';

/**
 * List of option for a {@link UserCategory}
 */
@Component({
  selector: 'gen-select-user-category-option',
  templateUrl: './select-user-category-option.component.html',
  styleUrls: ['./select-user-category-option.component.scss']
})
export class SelectUserCategoryOptionComponent extends EmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  // in basic mode, the ADMIN category is not shown
  @Input() mode: 'all' | 'basic' = 'basic';

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
