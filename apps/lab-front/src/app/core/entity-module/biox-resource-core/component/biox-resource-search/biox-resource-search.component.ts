import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FL_SEARCH_CONFIG,
  FlDatasourcePaginated,
  FlDialogService,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchService,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {BioxResourceSearch, BioxResourceSearchFields} from '../../model/biox-resource-advanced-search.class';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {
  UploadFsNodeDialogComponent,
  UploadFsNodeDialogInput,
  UploadFsNodeMode
} from '../upload-fs-node-dialog/upload-fs-node-dialog.component';
import {ClHelpService} from '@monorepo/core-lib';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [{
  searchName: 'biox-resource',
  id: null,
  label: 'Imported',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {origin: 'IMPORTED'} as Partial<BioxResourceSearchFields>
}];

/**
 * Configuration factory for the
 * */
function searchConfig(searchService: FlSearchService<any>): FlSearchConfig {
  return {
    version: 1,
    searchService: searchService,
    buildAdvancedForm: BioxResourceSearch.getAdvancedSearchForm,
    advancedFormClass: BioxResourceSearchFields,
    savedSearch: savedSearch,
    advancedSearchFormManagerConfig: BioxResourceSearch.advancedSearchManagerConfig
  };
}

/**
 * Complete component to search on resource. It supports a select mode and manage file upload.
 */
@Component({
  selector: 'gen-biox-resource-search',
  templateUrl: './biox-resource-search.component.html',
  styleUrls: ['./biox-resource-search.component.scss'],
  providers: [
    FlSearchState,
    {provide: FL_SEARCH_CONFIG, useFactory: searchConfig, deps: [BioxResourceService]}
  ]

})
export class BioxResourceSearchComponent implements OnInit {

  @Input() resourceSelectable: boolean = false;

  @Output() resourceSelected: EventEmitter<BioxResource> = new EventEmitter<BioxResource>();


  datasource: FlDatasourcePaginated<BioxResource>;

  savedSearch: FlSavedSearch[] = savedSearch;

  columns: FlTableColumn<BioxResource>[] = ['name', 'info',
    {columnName: 'resource_type', accessor: 'resourceTypeHumanName'},
    'tags', 'createdAt'];

  files: File[];


  constructor(private searchState: FlSearchState<any>,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    // in none selectable mode, we add the action column
    if (!this.resourceSelectable) {
      this.columns.push('action');
    }

    this.datasource = this.searchState.datasource;
  }

  toggleDrawer(): void {
    this.searchState.toggleDrawer();
  }

  selectResource(resource: BioxResource): void {
    this.resourceSelected.next(resource);
  }


  //////////////////////////// FILE ///////////////////////
  uploadFiles(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'files');
  }

  uploadFolder(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'folder');
  }

  private uploadFsNode(fileEvent: File | File[], selectedNodes: UploadFsNodeMode): void {
    const files: File[] = ClHelpService.convertObjectOrArrayToArray(fileEvent);
    if (files.length === 0) {
      return;
    }

    const data: UploadFsNodeDialogInput = {
      selectedNodes: selectedNodes,
      files: files
    };
    this.dialogService.openSmallDialog(UploadFsNodeDialogComponent, {data: data});

    // clear the list of files
    this.files = [];
  }
}
