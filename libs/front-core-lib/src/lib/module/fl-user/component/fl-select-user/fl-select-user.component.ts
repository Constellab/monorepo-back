import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {FlUserConfig, FlUserConfigSearchNameMode} from '../../service/fl-user-config.config';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {Observable} from 'rxjs';
import {NgControl} from '@angular/forms';
import {FlUser} from '../../model/fl-user.class';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';

/**
 * Input/Select component to search for a user and select one.
 * It uses the FlInputSearchComponent to search for users.
 */
@Component({
  selector: 'fl-select-user',
  templateUrl: './fl-select-user.component.html',
  styleUrls: ['./fl-select-user.component.scss'],
  providers: [{provide: FlFormFieldDirective, useExisting: FlSelectUserComponent}]

})
export class FlSelectUserComponent extends FlFormFieldDirective<FlUser> implements OnInit {

  @Input() placeholder: string;

  @Input() mode: FlUserConfigSearchNameMode = 'space';

  @Output() valueChange: EventEmitter<FlUser> = new EventEmitter();

  selectedUser: FlUser | Observable<FlUser>;

  usersDatasource: FlDatasourcePaginated<FlUser>;

  constructor(private userConfig: FlUserConfig,
              @Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.usersDatasource = this.userConfig.getSearchByNamesDatasource(this.mode);
  }

  callChangeEvent(value: FlUser): void {
    this.valueChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: FlUser): void {
    if (obj == null || obj.id == null) {
      this.selectedUser = null;
      this.value = null;
      return;
    }

    // if the user is not complete
    if (obj.firstname == null || obj.lastname == null) {
      this.selectedUser = this.userConfig.getUserById(obj.id);
    } else {
      // if the user is complete
      this.selectedUser = obj;
    }
    this.value = obj;
  }

  onFocused(selectedUser?: FlUser): void {
    // by default add the current user and selected user
    const users: FlUser[] = [];
    if (selectedUser) {
      users.push(selectedUser);
    }

    const currentUser = this.userConfig.getAuthenticatedUser();
    if (selectedUser == null || selectedUser.id !== currentUser.id) {
      users.push(currentUser);
    }

    this.usersDatasource.setPageData(users);
  }


}
