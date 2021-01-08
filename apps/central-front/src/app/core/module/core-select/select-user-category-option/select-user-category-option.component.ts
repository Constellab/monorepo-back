import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

/**
 * List of option for a {@link UserCategory}
 */
@Component({
  selector: 'gen-select-user-category-option',
  templateUrl: './select-user-category-option.component.html',
  styleUrls: ['./select-user-category-option.component.scss']
})
export class SelectUserCategoryOptionComponent extends FlEmbeddedOptionsAbstractDirective
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
