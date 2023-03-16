import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

/**
 * List of option for a {@link CmUserCategory}
 */
@Component({
  selector: 'ca-select-user-category-option',
  templateUrl: './ca-select-user-category-option.component.html',
  styleUrls: ['./ca-select-user-category-option.component.scss']
})
export class CaSelectUserCategoryOptionComponent extends FlEmbeddedOptionsAbstractDirective
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
