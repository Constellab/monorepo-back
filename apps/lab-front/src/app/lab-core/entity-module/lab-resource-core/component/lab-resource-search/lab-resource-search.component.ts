import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  FlDatasourcePaginated,
  FlDialogService,
  FlPortalAction,
  FlPortalActionsService,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlTag,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabResourceSearch, LabResourceSearchFields} from '../../model/lab-resource-advanced-search.class';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {
  LabFsNodeTypesSelectionDialogComponent,
  LabFsNodeTypesSelectionDialogInput,
  LabFsNodeTypesSelectionDialogMode,
  LabFsNodeTypesSelectionDialogResult
} from '../lab-fs-node-types-selection-dialog/lab-fs-node-types-selection-dialog.component';
import {ClCoreJsonConvert, ClHelpService} from '@monorepo/core-lib';
import {Subscription} from 'rxjs';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {LabRouterService} from '../../../../service/lab-router.service';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [
  {
    searchName: 'biox-resource',
    id: null,
    label: 'All',
    color: flThemeDetailLight.primary,
    version: 1,
    default: true,
    filtersCriteria: {} as Partial<LabResourceSearchFields>
  },
  {
    searchName: 'biox-resource',
    id: null,
    label: 'Uploaded',
    color: flThemeDetailLight.primary,
    version: 1,
    default: false,
    filtersCriteria: {origin: 'UPLOADED'} as Partial<LabResourceSearchFields>
  },
  {
    searchName: 'biox-resource',
    id: null,
    label: 'Generated',
    color: flThemeDetailLight.primary,
    version: 1,
    default: false,
    filtersCriteria: {origin: 'GENERATED'} as Partial<LabResourceSearchFields>
  }];

/**
 * Complete component to search on resource. It supports a select mode and manage file upload.
 */
@Component({
  selector: 'lab-resource-search',
  templateUrl: './lab-resource-search.component.html',
  styleUrls: ['./lab-resource-search.component.scss'],
  providers: [
    FlSearchState,
  ]

})
export class LabResourceSearchComponent implements OnInit, OnDestroy {

  @Input() resourceSelectable: boolean = false;

  @Input() fullPageSearch: boolean = true;

  @Output() resourceSelected: EventEmitter<LabResource> = new EventEmitter<LabResource>();


  datasource: FlDatasourcePaginated<LabResource>;

  savedSearch: FlSavedSearch[] = savedSearch;

  columns: FlTableColumn<LabResource>[] = ['name', 'info',
    {columnName: 'resource_type', accessor: 'resourceTypeHumanName'},
    'tags', 'created'];

  files: File[];

  private actionSubscription: Subscription;

  constructor(private searchState: FlSearchState<any>,
              private dialogService: FlDialogService,
              private actionsService: FlPortalActionsService,
              private fileResourceService: LabFileResourceService,
              private resourceService: LabResourceService) {
  }

  ngOnInit(): void {
    // in none selectable mode, we add the action column
    if (!this.resourceSelectable) {
      this.columns.push('action');
    }

    const searchConfig: FlSearchConfig = {
      version: 1,
      searchFunc: this.resourceService.getAdvancedSearchFunction(),
      buildAdvancedForm: LabResourceSearch.getAdvancedSearchForm,
      advancedFormClass: LabResourceSearchFields,
      savedSearch: savedSearch,
      advancedSearchFormManagerConfig: LabResourceSearch.advancedSearchManagerConfig,
      storeSearchInUrl: this.fullPageSearch
    };
    this.searchState.init(searchConfig);
    this.datasource = this.searchState.datasource;
    this.listenToUploadAction();
  }

  selectResource(resource: LabResource): void {
    this.resourceSelected.next(resource);
  }

  searchOnTag(tag: FlTag): void {
    const search: Partial<LabResourceSearchFields> = {
      tags: [tag]
    };
    this.searchState.callAdvancedSearchFromObject(search);
  }


  //////////////////////////// FILE ///////////////////////
  openUploadFiles(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'files');
  }

  openUploadFolder(fileEvent: File | File[]): void {
    this.uploadFsNode(fileEvent, 'filesOrFolder');
  }

  private uploadFsNode(fileEvent: File | File[], selectedNodes: LabFsNodeTypesSelectionDialogMode): void {
    const files: File[] = ClHelpService.convertObjectOrArrayToArray(fileEvent);
    if (files.length === 0) {
      return;
    }

    const data: LabFsNodeTypesSelectionDialogInput = {
      dialogMode: selectedNodes,
      filenames: files.map(file => file.name)
    };
    this.dialogService.openSmallDialog(LabFsNodeTypesSelectionDialogComponent, {data: data}).afterClosed().subscribe({
      next: result => this.onUploadFsNodeClosed(result, files)
    });


    // clear the list of files
    this.files = [];
  }

  private onUploadFsNodeClosed(result: LabFsNodeTypesSelectionDialogResult, files: File[]): void {
    if (result == null) return;
    if (result.uploadMode === 'files') {
      this.uploadFiles(result.fileTypingNames, files);
    } else {
      this.uploadFolder(result.folderTypingName, files);
    }
  }

  private uploadFiles(fileTypingNames: string[], files: File[]): void {

    for (let i = 0; i < fileTypingNames.length; i++) {
      const action: FlPortalAction = {
        text: files[i].name,
        type: LabFileResourceService.uploadFileActon,
        action: this.fileResourceService.uploadFile(files[i], fileTypingNames[i]),
        trackHttpEvents: true,
        successLink: result => LabRouterService.getResourceDetailRoute(result.id)
      };

      this.actionsService.addAction(action, false);
    }
  }

  private uploadFolder(folderTypingName: string, files: File[]): void {
    const action: FlPortalAction = {
      text: {text: 'databox.uploading_folder', translateText: true},
      type: LabFileResourceService.uploadFileActon,
      action: this.fileResourceService.uploadFolder(folderTypingName, files),
      trackHttpEvents: true,
    };

    this.actionsService.addAction(action, false);
  }


  public listenToUploadAction(): void {
    this.actionSubscription = this.actionsService.getResult$(LabFileResourceService.uploadFileActon).subscribe(
      result => {
        if (result.status == 'success') {
          this.datasource.addItem(ClCoreJsonConvert.deserialize(result.result, LabResource), () => true);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.actionSubscription?.unsubscribe();
  }


}
