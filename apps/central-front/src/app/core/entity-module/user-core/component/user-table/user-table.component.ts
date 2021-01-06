import {Component, ContentChild, OnInit, TemplateRef} from '@angular/core';
import {TableAbstractDirective} from '../../../../abstract-directive/table-abstract.directive';
import {User} from '../../../../model/entities/user.class';
import {ViewContext} from '../../../../model/global/view-context.class';

/**
 * Table to display users
 * It supports a template content in column
 */
@Component({
  selector: 'gen-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent extends TableAbstractDirective<User> implements OnInit {

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() {
    super(['photo', 'fullname', 'createdAt', 'customTemplate']);
  }

  ngOnInit(): void {
  }

  getUserViewContext(user: User): ViewContext<User> {
    return {$implicit: user};
  }

}
