import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-report-advanced-search-form',
  templateUrl: './lab-report-advanced-search-form.component.html',
  styleUrls: ['./lab-report-advanced-search-form.component.scss']
})
export class LabReportAdvancedSearchFormComponent implements OnInit {

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

}
