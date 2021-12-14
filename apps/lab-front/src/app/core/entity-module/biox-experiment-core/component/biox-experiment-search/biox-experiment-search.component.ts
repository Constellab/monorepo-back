import {Component, OnInit} from '@angular/core';
import {
  FL_SEARCH_CONFIG,
  FlDatasourcePaginated,
  FlDialogService,
  FlFormDialogInput,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchService,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {BioxExperimentSearch, BioxExperimentSearchFields} from '../../model/biox-experiment-advanced-search.class';
import {BioxExperimentService} from '../../../../entity-service/biox-experiment.service';
import {BioxExperiment} from '../../../../model/entities/biox-experiment.entity';
import {BioxExperimentFormDialogComponent} from '../biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {RouterService} from '../../../../service/router.service';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [{
  searchName: 'biox-experiment',
  id: null,
  label: 'Experiments',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {type: 'EXPERIMENT'} as Partial<BioxExperimentSearchFields>
}];

/**
 * Configuration factory for the
 * */
function searchConfig(searchService: FlSearchService<any>): FlSearchConfig {
  return {
    version: 1,
    searchService: searchService,
    buildAdvancedForm: BioxExperimentSearch.getAdvancedSearchForm,
    advancedFormClass: BioxExperimentSearchFields,
    savedSearch: savedSearch,
    advancedSearchFormManagerConfig: BioxExperimentSearch.advancedSearchManagerConfig
  };
}

@Component({
  selector: 'gen-biox-experiment-search',
  templateUrl: './biox-experiment-search.component.html',
  styleUrls: ['./biox-experiment-search.component.scss'],
  providers: [
    FlSearchState,
    {provide: FL_SEARCH_CONFIG, useFactory: searchConfig, deps: [BioxExperimentService]}
  ]
})
export class BioxExperimentSearchComponent implements OnInit {

  datasource: FlDatasourcePaginated<BioxExperiment>;

  columns: FlTableColumn<BioxExperiment>[] = ['title', 'status', 'tags', 'createdAt'];

  constructor(private searchState: FlSearchState<any>,
              private bioxExperimentService: BioxExperimentService,
              private dialogService: FlDialogService,
              private routerService: RouterService) {
  }

  ngOnInit(): void {
    this.datasource = this.searchState.datasource;
  }

  createExperiment(): void {
    const input: FlFormDialogInput<BioxExperiment> = {mode: 'create'};
    this.dialogService.openSmallDialog(BioxExperimentFormDialogComponent,
      {data: input, panelClass: 'g-dialog-allow-overflow'}).afterClosed().subscribe(
      experiment => this.onCreateExperimentClosed(experiment)
    );
  }

  private onCreateExperimentClosed(experiment?: BioxExperiment): void {
    if (experiment) {
      this.routerService.navigateToBioxExperimentDetail(experiment.id);
    }
  }
}
