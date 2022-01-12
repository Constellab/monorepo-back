import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-type-advanced-search-form',
  templateUrl: './lab-type-advanced-search-form.component.html',
  styleUrls: ['./lab-type-advanced-search-form.component.scss']
})
export class LabTypeAdvancedSearchFormComponent implements OnInit {

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }
}
