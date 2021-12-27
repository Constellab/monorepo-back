import {Inject, Injectable, OnDestroy} from '@angular/core';
import {FlDatasourcePaginated} from '../../../model/datasource/fl-datasource-paginated.class';
import {FormGroup} from '@ngneat/reactive-forms';
import {MatDrawer} from '@angular/material/sidenav';
import {FL_SEARCH_CONFIG, FlSearchConfig} from './fl-search-state-config.class';
import {FlSearchService} from './fl-search-service.class';
import {FlEntityPaginatedDatasource} from '../../../model/datasource/fl-entity-datasource.class';
import {FlEntity} from '../../../model/fl-entity.class';
import {ActivatedRoute, Router} from '@angular/router';
import {FlAdvancedSearchObject, FlSearchPageUrlHelper, FlSearchUrlObject} from './fl-search-url.helper';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {FlSavedSearch} from './fl-saved-search.class';

type FlSearchMode = 'advanced' | 'default';


/**
 * Use to manage the start of a search component.
 */
@Injectable()
export class FlSearchState<T extends FlEntity> implements OnDestroy {

  // datasource containing the data
  public readonly datasource: FlDatasourcePaginated<T>;

  // service for the search
  private readonly searchService: FlSearchService<T>;

  // form group instance of the advanced form
  public readonly advancedSearchFormGroup: FormGroup;

  // timestamp code of the last search to prevent calling the same search twice
  private lastSearchTimestamp: string;

  private drawer: MatDrawer;
  private routeSubscription: Subscription;

  private storeSearchInUrl: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              @Inject(FL_SEARCH_CONFIG) private config: FlSearchConfig) {
    this.advancedSearchFormGroup = config.buildAdvancedForm();
    this.searchService = config.searchService;
    this.datasource = new FlEntityPaginatedDatasource(
      this.searchService.advancedSearch.bind(this.searchService), 20, false);
  }

  public setDrawer(drawer: MatDrawer): void {
    this.drawer = drawer;
  }

  /**
   * Init the search page and call first search
   * @param storeSearchInUrl if true the url is modified
   */
  public init(storeSearchInUrl: boolean): void {
    this.storeSearchInUrl = storeSearchInUrl;

    if (storeSearchInUrl) {
      this.subscribeToNavigation();
    } else {
      this.initFirstSearch();
    }
  }


  // call advanced search form advanced search form
  public callAdvancedSearchFromForm(): void {
    const advancedSearch: FlAdvancedSearchObject = this.callAdvancedSearch(this.advancedSearchFormGroup.getRawValue());

    const timestamp = this.generateSearchTimestamp();

    if (this.storeSearchInUrl) {
      this.saveAdvancedSearchInUrl(advancedSearch, timestamp);
    }
  }

  // call advanced search from a saved search
  public callAdvancedSearchFromSavedSearch(savedSearch: FlSavedSearch): void {
    const advancedSearchObject = this.callAdvancedSearch(savedSearch.filtersCriteria);
    this.patchAdvancedFormGroup(savedSearch.filtersCriteria);

    const timestamp = this.generateSearchTimestamp();
    if (this.storeSearchInUrl) {
      this.saveAdvancedSearchInUrl(advancedSearchObject, timestamp);
    }
  }

  // call the advanced search from a URL change
  private callAdvancedSearchFromUrl(filtersCriteria: any, timestamp: string): void {
    this.callAdvancedSearch(filtersCriteria);
    this.lastSearchTimestamp = timestamp;

    this.patchAdvancedFormGroup(filtersCriteria);
  }

  // method to just call advanced search function
  private callAdvancedSearch(filtersCriteria: any): FlAdvancedSearchObject {
    // call first page and set data
    this.datasource.getFirstPage(filtersCriteria);


    // if the drawer is in over mode (small screens) close it
    if (this.drawer?.mode === 'over') {
      this.closeDrawer();
    }

    return {filtersCriteria: filtersCriteria};
  }

  /////////////////////////////////////////////////// URL ///////////////////////////////////////////////////

  // subscribe to navigation to call advanced search if it is a navigation back
  private subscribeToNavigation(): void {
    // subscribe to current url on init
    this.route.queryParams.pipe(first()).subscribe(
      params => {
        // init the search with param of url
        this.initFirstSearch(params as any);

        // after init, subscribe to route change to call search is needed
        this.routeSubscription = this.route.queryParams.subscribe(
          params => this.checkAndCallSearchFromUrl(params as any)
        );
      });
  }

  /**
   * Call first search
   * If a search in the URL exist, call
   * Else if there is a default saved advanced search, call it
   * Otherwise call the default search if it exists
   */
  private initFirstSearch(params?: FlSearchUrlObject): void {
    // call the advanced search from query params if they exists
    if (this.checkAndCallSearchFromUrl(params as any)) {
      return;
    }

    const savedSearch: FlSavedSearch = this.config.savedSearch?.find(search => search.default) ?? null;
    if (savedSearch) {
      this.callAdvancedSearchFromSavedSearch(savedSearch);
    }
  }

  /**
   * check the url query params and if valid, it calls the advanced search
   * if the search is called, it returns true
   */
  private checkAndCallSearchFromUrl(params: FlSearchUrlObject): boolean {
    if (params == null) return false;

    // prevent calling the save search twice
    if (this.lastSearchTimestamp && params.timestamp === this.lastSearchTimestamp) {
      return false;
    }

    const mode: FlSearchMode = params?.mode as FlSearchMode;

    switch (mode) {
      case 'advanced':
        const formValue: FlAdvancedSearchObject = FlSearchPageUrlHelper.advancedSearchFromString(params?.search);

        if (formValue != null) {
          try {
            const filtersCriteria = ClCoreJsonConvert.deserialize(formValue.filtersCriteria, this.config.advancedFormClass);
            this.callAdvancedSearchFromUrl(filtersCriteria, params.timestamp);
            return true;
          } catch {
            return false;
          }
        }
        return false;

      case 'default':
        // this.callDefaultSearch();
        return true;
    }

    return false;
  }


  // search the default mode search in url
  private saveDefaultSearchToURL(): void {
    // save the criteria list in the url as query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {mode: 'default'},
      // replace the url because the default search is call on load
      // so we don't need add historic
      replaceUrl: true
    });
  }

  // save the advanced form search in the url
  // store the last search timestamp in state
  private generateSearchTimestamp(): string {
    // save the search timestamp to prevent call on router
    this.lastSearchTimestamp = new Date().getTime().toString();

    return this.lastSearchTimestamp;
  }

  // save the advanced search in URL
  private saveAdvancedSearchInUrl(advancedSearch: FlAdvancedSearchObject, timestamp: string): void {
    // convert object to class and to plain json again to trigger transforms
    const convertedFilters = ClCoreJsonConvert.classToPlain(advancedSearch.filtersCriteria, this.config.advancedFormClass);
    const searchString: string = FlSearchPageUrlHelper.advancedSearchToString({filtersCriteria: convertedFilters});

    // limit length to avoid URL problem
    if (searchString.length < 1700) {
      const searchUrl = FlSearchPageUrlHelper.buildSearchUrlObject('advanced', searchString, timestamp);
      // save the criteria list in the url as query params
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: searchUrl,
        replaceUrl: true
      });
    }
  }

  private patchAdvancedFormGroup(value: any): void {
    this.advancedSearchFormGroup.reset(value);
  }

  public closeDrawer(): void {
    this.drawer.close();
  }

  public toggleDrawer(): void {
    this.drawer.toggle();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }


}
