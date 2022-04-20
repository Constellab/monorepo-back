import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlDatasourcePaginated,
  FlDialogService,
  FlFormDialogInput,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlTag,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabExperimentSearch, LabExperimentSearchFields} from '../../model/lab-experiment-advanced-search.class';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {LabExperimentFormDialogComponent} from '../lab-experiment-form-dialog/lab-experiment-form-dialog.component';
import {LabRouterService} from '../../../../service/lab-router.service';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [{
  searchName: 'lab-experiment',
  id: null,
  label: 'All experiments',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {type: 'EXPERIMENT', isValidated: false, isArchived: false} as Partial<LabExperimentSearchFields>
}];

@Component({
  selector: 'lab-experiment-search',
  templateUrl: './lab-experiment-search.component.html',
  styleUrls: ['./lab-experiment-search.component.scss'],
  providers: [
    FlSearchState,
  ]
})
export class LabExperimentSearchComponent implements OnInit {

  @Input() experimentSelectable: boolean = false;

  @Input() fullPageSearch: boolean = true;

  @Output() experimentSelected: EventEmitter<LabExperiment> = new EventEmitter();

  datasource: FlDatasourcePaginated<LabExperiment>;

  columns: FlTableColumn<LabExperiment>[] = ['title', 'status', 'tags', 'createdAt'];

  constructor(private searchState: FlSearchState<any>,
              private experimentService: LabExperimentService,
              private dialogService: FlDialogService,
              private routerService: LabRouterService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      searchFunc: this.experimentService.getAdvancedSearchFunction(),
      buildAdvancedForm: LabExperimentSearch.getAdvancedSearchForm,
      advancedFormClass: LabExperimentSearchFields,
      savedSearch: savedSearch,
      advancedSearchFormManagerConfig: LabExperimentSearch.advancedSearchManagerConfig,
      storeSearchInUrl: this.fullPageSearch
    };
    this.searchState.init(config);
    this.datasource = this.searchState.datasource;
  }

  createExperiment(): void {
    const input: FlFormDialogInput<LabExperiment> = {mode: 'create'};
    this.dialogService.openSmallDialog(LabExperimentFormDialogComponent,
      {data: input, panelClass: 'g-dialog-allow-overflow'}).afterClosed().subscribe(
      experiment => this.onCreateExperimentClosed(experiment)
    );
  }

  private onCreateExperimentClosed(experiment?: LabExperiment): void {
    if (experiment) {
      this.routerService.navigateToExperimentDetail(experiment.id);
    }
  }

  selectExperiment(experiment: LabExperiment): void {
    this.experimentSelected.next(experiment);
  }

  searchOnTag(tag: FlTag): void {
    const search: Partial<LabExperimentSearchFields> = {
      tags: [tag]
    };
    this.searchState.callAdvancedSearchFromObject(search);
  }
}
