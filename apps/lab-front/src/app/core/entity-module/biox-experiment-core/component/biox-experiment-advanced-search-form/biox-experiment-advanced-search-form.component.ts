import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-experiment-advanced-search-form',
  templateUrl: './biox-experiment-advanced-search-form.component.html',
  styleUrls: ['./biox-experiment-advanced-search-form.component.scss']
})
export class BioxExperimentAdvancedSearchFormComponent implements OnInit {

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

}
