import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {
  FlEmbeddedOptionsAbstractDirective
} from '../../../../abstract-directive/fl-embedded-options-abstract.directive';

/**
 * List of option for a {@link CmUserCategory}
 */
@Component({
  selector: 'fl-select-user-category-option',
  templateUrl: './fl-select-user-category-option.component.html',
  styleUrls: ['./fl-select-user-category-option.component.scss']
})
export class FlSelectUserCategoryOptionComponent extends FlEmbeddedOptionsAbstractDirective
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
