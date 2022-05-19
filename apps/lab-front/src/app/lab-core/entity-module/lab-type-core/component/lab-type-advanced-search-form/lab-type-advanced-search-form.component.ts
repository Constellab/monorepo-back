import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';
import {LabTypeSearchConfig} from '../../model/lab-type-advanced-search.class';

@Component({
  selector: 'lab-type-advanced-search-form',
  templateUrl: './lab-type-advanced-search-form.component.html',
  styleUrls: ['./lab-type-advanced-search-form.component.scss']
})
export class LabTypeAdvancedSearchFormComponent implements OnInit {

  @Input() config: LabTypeSearchConfig;

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  get showObjectSubTypeField(): boolean {
    return this.config.mode === 'taskOrProtocol';
  }

  get showImporterIgnoreExtensionField(): boolean {
    return this.config.mode === 'importer';
  }

}
