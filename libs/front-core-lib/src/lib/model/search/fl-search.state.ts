import {Inject, Injectable, OnDestroy} from '@angular/core';
import {FlDatasourcePaginated} from '../datasource/fl-datasource-paginated.class';
import {FormGroup} from '@ngneat/reactive-forms';
import {MatDrawer} from '@angular/material/sidenav';
import {FL_SEARCH_PAGE_CONFIG, FlSearchPageConfig} from './fl-search-state-config.class';
import {FlSearchService} from './fl-search-service.class';
import {FlEntityPaginatedDatasource} from '../datasource/fl-entity-datasource.class';
import {FlEntity} from '../fl-entity.class';
import {ActivatedRoute, Router} from '@angular/router';
import {FlAdvancedSearchObject, FlSearchPageUrlHelper} from './fl-search-url.helper';
import {first, skipWhile, tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ClCoreJsonConvert} from '@monorepo/core-lib';

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

  // use skip call advanced search when url change
  // start a one because the first call is manage by a specific method
  private queryParamSkip: number = 1;

  private drawer: MatDrawer;
  private routeSubscription: Subscription;


  constructor(private route: ActivatedRoute,
              private router: Router,
              @Inject(FL_SEARCH_PAGE_CONFIG) private config: FlSearchPageConfig) {
    this.advancedSearchFormGroup = config.buildAdvancedForm();
    this.searchService = config.searchService;
    this.datasource = new FlEntityPaginatedDatasource(
      this.searchService.advancedSearch.bind(this.searchService), 20, false);

    this.initFirstSearch();

    this.subscribeToNavigation();
  }

  public setDrawer(drawer: MatDrawer): void {
    this.drawer = drawer;
  }


  public newAdvancedSearch(): void {
    const advancedSearch: FlAdvancedSearchObject = {
      filtersCriteria: this.advancedSearchFormGroup.getRawValue()
    };

    this.callAdvancedSearch(advancedSearch.filtersCriteria);
    // save the form value to the url
    this.saveAdvancedSearchToURL(advancedSearch);
  }

  // method to just call advanced search function
  private callAdvancedSearch(searchCriteria: any): void {
    // call first page and set data
    this.datasource.getFirstPage(searchCriteria);

    // if the drawer is in over mode (small screens) close it
    if (this.drawer?.mode === 'over') {
      this.closeDrawer();
    }
  }


  /////////////////////////////////////////////////// URL ///////////////////////////////////////////////////

  // subscribe to navigation to call advanced search if it is a navigation back
  private subscribeToNavigation(): void {
    this.routeSubscription = this.route.queryParams.pipe(
      // use to skip when route change is made before calling advanced search
      tap(() => this.queryParamSkip--),
      skipWhile(() => this.queryParamSkip >= 0),
    ).subscribe(
      params => this.checkAndCallSearchFromUrl(params)
    );
  }

  /**
   * Call first search
   * If a search in the URL exist, call
   * Else if there is a default saved advanced search, call it
   * Otherwise call the default search if it exists
   */
  private initFirstSearch(): void {
    this.route.queryParams.pipe(first()).subscribe(
      params => {
        // call the advanced search from query params if they exists
        if (this.checkAndCallSearchFromUrl(params)) {
          return;
        }

        // // automatic select default value
        // const defaultBoard: UserBoard = await this.userBoardState.getDefaultBoard();
        // if (defaultBoard) {
        //   this.callUserBoard(defaultBoard);
        //
        //   return;
        // }
        //
        // // call default search if exists
        // this.newDefaultSearch();
        return;
      }
    );
  }

  /**
   * check the url query params and if valid, it calls the advanced search
   * if the search is called, it returns true
   */
  private checkAndCallSearchFromUrl(params: any): boolean {
    const mode: FlSearchMode = params?.mode;

    switch (mode) {
      case 'advanced':
        const formValue: FlAdvancedSearchObject = FlSearchPageUrlHelper.advancedSearchFromString(params?.search);

        if (formValue != null) {
          try {
            formValue.filtersCriteria = ClCoreJsonConvert.deserialize(formValue.filtersCriteria, this.config.advancedFormClass);
          } catch {
            return false;
          }

          // set the value as apply in the state to refresh the advanced search form
          this.patchAdvancedFormGroup(formValue.filtersCriteria);
          this.callAdvancedSearch(formValue.filtersCriteria);
          return true;
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
    // set skip to 1 to avoid double search call with route subscription
    this.queryParamSkip = 1;

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
  private saveAdvancedSearchToURL(advancedSearch: FlAdvancedSearchObject): void {
    const convertedFilters = ClCoreJsonConvert.classToPlain(advancedSearch.filtersCriteria, this.config.advancedFormClass);
    const searchString: string = FlSearchPageUrlHelper.advancedSearchToString({filtersCriteria: convertedFilters});
    // limit length to avoid URL problem
    if (searchString.length < 1700) {
      // set skip to 1 to avoid double search call with route subscription
      this.queryParamSkip = 1;

      // save the criteria list in the url as query params
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: FlSearchPageUrlHelper.getSearchPageQueryParams('advanced', searchString),
      });
    }
  }

  private patchAdvancedFormGroup(value: any): void {
    this.advancedSearchFormGroup.reset(value);
  }

  public closeDrawer(): void {
    this.drawer.close();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }


}
