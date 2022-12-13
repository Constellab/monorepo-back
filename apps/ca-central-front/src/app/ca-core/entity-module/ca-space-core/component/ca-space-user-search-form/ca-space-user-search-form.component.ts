import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {CaSpaceRole} from '../../../../model/entities/space/ca-space-user.class';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-space-user-search-form',
  templateUrl: './ca-space-user-search-form.component.html',
  styleUrls: ['./ca-space-user-search-form.component.scss']
})
export class CaSpaceUserSearchFormComponent implements OnInit {

  formGp: UntypedFormGroup;

  userRoles = CaSpaceRole;


  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }
}
