import {Injectable, OnDestroy} from '@angular/core';
import {FlBioNetwork, FlBioNetworkPathwayDetail, FlPathwayDatabase} from '../model/fl-bio-network.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlBioxNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkFactory} from '../utils/fl-bio-network.factory';
import {ClHelpService} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from '../utils/fl-bio-network.helper';
import {debounceTime, map} from 'rxjs/operators';
import {SelectionModel} from '@angular/cdk/collections';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlThemeService} from '../../../service/fl-theme.service';
import {ZoomTransform} from 'd3-zoom';


/**
 * State containing the data for the pathway
 */
@Injectable()
export class FlBioNetworkState implements OnDestroy {

  public networks: FlBioNetwork[];
  private selectedNetwork$: BehaviorSubject<FlBioNetwork | null>;
  private chartData$: BehaviorSubject<FlBioxNetworkD3 | null>;
  private database$: BehaviorSubject<FlPathwayDatabase | null>;

  public selectedPathways: SelectionModel<string>;

  // used to cache the list of pathway
  private pathwayListCache: Record<FlPathwayDatabase | string, FlBioNetworkPathwayDetail[]>;

  // use to save the zoom information between 2 drawings
  public zoomTransform: ZoomTransform;

  constructor(private translateService: FlTranslateService, private themeService: FlThemeService) {
  }


  public init(networks: FlBioNetwork | FlBioNetwork[], defaultDb: FlPathwayDatabase): void {
    this.initNetworks(networks);

    this.selectedNetwork$ = new BehaviorSubject(this.networks[0]);
    this.chartData$ = new BehaviorSubject(null);
    this.database$ = new BehaviorSubject(defaultDb);
    this.selectedPathways = new SelectionModel(true, []);

    this.pathwayListCache = {};

    // load the pathway
    const pathwayList: FlBioNetworkPathwayDetail[] = this.getPathwayList(defaultDb);
    // if there is only one pathway, select it by default
    if (pathwayList.length === 1) {
      this.selectPathways([pathwayList[0].id]);
    }

    this.selectedPathways.changed.pipe(
      // use a debounce time to prevent rebuilding the graph to much
      debounceTime(500)
    ).subscribe(
      (selectionChange) => this.selectPathways(selectionChange.source.selected)
    );
  }

  public selectNetwork(name: string): void {
    // find the network with the name
    const network: FlBioNetwork = this.networks.find(network => network.name === name);
    this.selectedNetwork$.next(network);
    this.selectedPathways.clear();
  }

  // select specific pathway in the network to display
  public selectPathways(pathwayIds: string[]): void {
    // if no ids are selected, we return null
    if (ClHelpService.isNullOrEmpty(pathwayIds) || this.getDatabase() == null ||
      this.getSelectedNetwork() == null) {
      this.chartData$.next(null);
      return;
    }
    const chartData: FlBioxNetworkD3 = new FlBioNetworkFactory(this.themeService.getCurrentThemeDetail().greyHighContrast)
      .convertPathwayToChartPathway(this.getSelectedNetwork(), pathwayIds, this.getDatabase());

    this.chartData$.next(chartData);
  }

  public getChartData$(): Observable<FlBioxNetworkD3 | null> {
    return this.chartData$.asObservable();
  }


  // return he list of reactions' pathways
  public getPathwayList$(): Observable<FlBioNetworkPathwayDetail[]> {
    return this.getDatabase$().pipe(
      map(database => this.getPathwayList(database))
    );
  }

  private getPathwayList(database: FlPathwayDatabase): FlBioNetworkPathwayDetail[] {
    if (database == null || this.getSelectedNetwork() == null) {
      return [];
    }

    if (this.pathwayListCache[database] == null) {
      this.pathwayListCache[database] = FlBioNetworkHelper.getPathwaysList(this.getSelectedNetwork(), database);
    }

    return this.pathwayListCache[database];
  }

  public selectDatabase(database: FlPathwayDatabase): void {
    this.database$.next(database);
    // clear the pathway selection on change
    this.selectedPathways.clear();
  }

  public getDatabase$(): Observable<FlPathwayDatabase> {
    return this.database$.asObservable();
  }

  public getDatabase(): FlPathwayDatabase {
    return this.database$.value;
  }

  public getSelectedNetwork(): FlBioNetwork {
    return this.selectedNetwork$.value;
  }

  public getCompartments$(): Observable<Record<string, string>> {
    return this.selectedNetwork$.pipe(
      map(network => network.compartments)
    );
  }

  private initNetworks(networks: FlBioNetwork | FlBioNetwork[]): void {
    const networksArray: FlBioNetwork[] = ClHelpService.convertObjectOrArrayToArray(networks);

    // set a default name to the networks if they don't have a name
    for (let i = 0; i < networksArray.length; i++) {
      if (ClHelpService.isNullOrEmpty(networksArray[i].name)) {
        networksArray[i].name = this.translateService.translate('flBioNetwork.network') + ' ' + (i + 1);
      }
    }
    this.networks = networksArray;
  }


  ngOnDestroy(): void {
    this.chartData$.complete();
    this.database$.complete();
  }


}

