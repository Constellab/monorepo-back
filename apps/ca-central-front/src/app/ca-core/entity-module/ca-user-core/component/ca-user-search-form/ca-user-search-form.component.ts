import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';
import {CmUserCategory} from '@monorepo/common-model';

@Component({
  selector: 'ca-user-search-form',
  templateUrl: './ca-user-search-form.component.html',
  styleUrls: ['./ca-user-search-form.component.scss']
})
export class CaUserSearchFormComponent implements OnInit {
  formGp: UntypedFormGroup;

  userCategories = CmUserCategory;

  constructor(private searchState: FlSearchState<any>) { }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

}
