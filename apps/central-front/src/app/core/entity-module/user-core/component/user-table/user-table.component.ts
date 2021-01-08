import {Component, ContentChild, OnInit, TemplateRef} from '@angular/core';
import {User} from '../../../../model/entities/user.class';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {FlViewContext} from '@monorepo/front-core-lib';

/**
 * Table to display users
 * It supports a template content in column
 */
@Component({
  selector: 'gen-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent extends FlTableAbstractDirective<User> implements OnInit {

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() {
    super(['photo', 'fullname', 'createdAt', 'customTemplate']);
  }

  ngOnInit(): void {
  }

  getUserViewContext(user: User): FlViewContext<User> {
    return {$implicit: user};
  }

}
