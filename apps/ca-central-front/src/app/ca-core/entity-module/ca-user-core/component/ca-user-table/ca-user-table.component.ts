import {Component, ContentChild, OnInit, TemplateRef} from '@angular/core';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {FlTableAbstractDirective, FlViewContext} from '@monorepo/front-core-lib';

/**
 * Table to display users
 * It supports a template content in column
 */
@Component({
  selector: 'ca-user-table',
  templateUrl: './ca-user-table.component.html',
  styleUrls: ['./ca-user-table.component.scss']
})
export class CaUserTableComponent extends FlTableAbstractDirective<CaUser> implements OnInit {

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() {
    super(['fullname', 'createdAt', 'category', 'phone', 'lastLogin', 'customTemplate']);
  }

  ngOnInit(): void {
  }

  getUserViewContext(user: CaUser): FlViewContext<CaUser> {
    return {$implicit: user};
  }

}
