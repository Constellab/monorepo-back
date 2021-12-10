import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlFormInputsManagerConfig} from '../../../fl-form-inputs-manager/fl-form-inputs-manager.class';
import {FlSearchState} from '../../model/fl-search.state';
import {FL_SEARCH_CONFIG, FlSearchConfig} from '../../model/fl-search-state-config.class';

/**
 * Component to place under the {@link FlSearchComponent} and this contains the advanced search form
 */
@Component({
  selector: 'fl-search-advanced-form',
  templateUrl: './fl-search-advanced-form.component.html',
  styleUrls: ['./fl-search-advanced-form.component.scss']
})
export class FlSearchAdvancedFormComponent implements OnInit {

  formGp: FormGroup;

  formInputConfig: FlFormInputsManagerConfig;

  constructor(@Inject(FL_SEARCH_CONFIG) config: FlSearchConfig,
              private searchState: FlSearchState<any>) {
    this.formInputConfig = config.advancedSearchFormManagerConfig;
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  submit(): void {
    if (this.formGp.valid) {
      this.searchState.callAdvancedSearchFromForm();
    }
  }
}
