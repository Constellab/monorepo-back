import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {FlEntityPaginatedDatasource, FlFormFieldDirective} from '@monorepo/front-core-lib';
import {CaSpace, CaSpaceDatasource} from '../../../../model/entities/space/ca-space.class';
import {Observable} from 'rxjs';
import {NgControl} from '@angular/forms';
import {CaSpaceService} from '../../../../service-api/ca-space.service';
import {CaCurrentSpaceService} from '../../../../service-api/ca-current-space.service';

@Component({
  selector: 'ca-select-space',
  templateUrl: './ca-select-space.component.html',
  styleUrls: ['./ca-select-space.component.scss'],
  providers: [{provide: FlFormFieldDirective, useExisting: CaSelectSpaceComponent}]

})
export class CaSelectSpaceComponent extends FlFormFieldDirective<CaSpace> implements OnInit {

  @Input() placeholder: string;

  @Output() valueChange: EventEmitter<CaSpace> = new EventEmitter();

  selectedSpace: CaSpace | Observable<CaSpace>;

  spaceDatasource: CaSpaceDatasource;

  constructor(private spaceService: CaSpaceService,
              private currentSpaceService: CaCurrentSpaceService,
              @Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.spaceDatasource = new FlEntityPaginatedDatasource(
      (page, size, name) => this.spaceService.searchByNames(name, page, size),
      20, false
    );
  }

  callChangeEvent(value: CaSpace): void {
    this.valueChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: CaSpace): void {
    if (obj == null || obj.id == null) {
      this.selectedSpace = null;
      this.value = null;
      return;
    }

    // if the user is not complete
    if (obj.name == null) {
      this.selectedSpace = this.spaceService.getById(obj.id);
    } else {
      // if the user is complete
      this.selectedSpace = obj;
    }
    this.value = obj;
  }

  async onFocused(selectedSpace?: CaSpace): Promise<void> {
    // by default add the current user and selected user
    const users: CaSpace[] = [];
    if (selectedSpace) {
      users.push(selectedSpace);
    }

    const currentUser = await this.currentSpaceService.getCurrentSpacePromise();
    if (selectedSpace == null || selectedSpace.id !== currentUser.id) {
      users.push(currentUser);
    }

    this.spaceDatasource.setPageData(users);
  }

}
