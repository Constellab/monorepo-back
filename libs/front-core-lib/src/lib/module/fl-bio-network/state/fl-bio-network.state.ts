import {Injectable, OnDestroy} from '@angular/core';
import {FlBioNetwork, FlBioNetworkPathwaySelection, FlPathwayDatabase} from '../model/fl-bio-network.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlBioNetworkFactory} from '../utils/fl-bio-network.factory';
import {ClHelpService} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from '../utils/fl-bio-network.helper';
import {debounceTime, map} from 'rxjs/operators';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioxNetworkD3} from '../model/fl-bio-network-d3-network.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';


/**
 * State containing the data for the pathway
 */
@Injectable()
export class FlBioNetworkState implements OnDestroy {

  public networks: FlBioNetwork[];
  private selectedNetwork$: BehaviorSubject<FlBioNetwork | null>;
  private chartData$: BehaviorSubject<FlBioxNetworkD3 | null>;
  private database$: BehaviorSubject<FlPathwayDatabase | null>;

  private pathways$: BehaviorSubject<FlBioNetworkPathwaySelection[]>;
  private pathwaySelectionChange$: BehaviorSubject<void>;

  // used to cache the list of pathway
  private pathwayListCache: Record<FlPathwayDatabase | string, FlBioNetworkPathwaySelection[]>;

  constructor(private translateService: FlTranslateService, private themeService: FlThemeService) {
  }


  public init(networks: FlBioNetwork | FlBioNetwork[], defaultDb: FlPathwayDatabase): void {
    this.initNetworks(networks);

    this.selectedNetwork$ = new BehaviorSubject(this.networks[0]);
    this.chartData$ = new BehaviorSubject(null);
    this.database$ = new BehaviorSubject(defaultDb);
    this.pathways$ = new BehaviorSubject([]);
    this.pathwaySelectionChange$ = new BehaviorSubject(null);

    this.pathwayListCache = {};

    // load the pathway
    const pathwayList: FlBioNetworkPathwaySelection[] = this.getPathwayList(defaultDb);
    this.pathways$.next(pathwayList);
    // if there is only one pathway, select it by default
    if (pathwayList.length === 1) {
      this.selectPathways([pathwayList[0]]);
    }

    this.pathwaySelectionChange$.pipe(
      // use a debounce time to prevent rebuilding the graph to much
      debounceTime(500)
    ).subscribe(
      () => this.selectPathways(this.pathways$.value)
    );
  }

  public selectNetwork(name: string): void {
    // find the network with the name
    const network: FlBioNetwork = this.networks.find(network => network.name === name);
    this.selectedNetwork$.next(network);
    this.pathways$.next([]);
    this.emitPathwaySelectionChange();
  }

  // select specific pathway in the network to display
  private selectPathways(pathways: FlBioNetworkPathwaySelection[]): void {
    pathways.forEach(pathway => pathway.highlighted = false);
    const pathwayIds: string[] = pathways.filter(pathway => pathway.selected).map(pathway => pathway.id);
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

  public selectAllPathways(): void {
    this.getCurrentPathways().forEach(pathway => pathway.selected = true);
    this.emitPathwaySelectionChange();
  }

  public unselectAllPathways(): void {
    this.getCurrentPathways().forEach(pathway => {
      pathway.selected = false;
      pathway.highlighted = false;
    });
    this.emitPathwaySelectionChange();
  }

  public getChartData$(): Observable<FlBioxNetworkD3 | null> {
    return this.chartData$.asObservable();
  }

  public getCurrentChartData(): FlBioxNetworkD3 | null {
    return this.chartData$.value;
  }


  private getPathwayList(database: FlPathwayDatabase): FlBioNetworkPathwaySelection[] {
    if (database == null || this.getSelectedNetwork() == null) {
      return [];
    }

    if (this.pathwayListCache[database] == null) {
      this.pathwayListCache[database] = FlBioNetworkHelper.getPathwaysList(this.getSelectedNetwork(), database).map(
        // convert pathway detail to pathwaySelection
        pathway => {
          const id = pathway.id ? pathway.id : pathway.name;
          const name = pathway.name ? pathway.name : pathway.id;
          return {
            id: id,
            name: name,
            selected: false,
            highlighted: false,
            color: FlColorHelper.stringToRGBColor(name)
          };
        }
      );
    }

    return this.pathwayListCache[database];
  }

  public selectDatabase(database: FlPathwayDatabase): void {
    this.database$.next(database);
    // clear the pathway selection on change
    this.pathways$.next([]);
    this.emitPathwaySelectionChange();
  }

  public emitPathwaySelectionChange(): void {
    this.pathwaySelectionChange$.next();
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

  public getPathways$(): Observable<FlBioNetworkPathwaySelection[]> {
    return this.pathways$.asObservable();
  }

  public getCurrentPathways(): FlBioNetworkPathwaySelection[] {
    return this.pathways$.value;
  }


  ngOnDestroy(): void {
    this.selectedNetwork$.complete();
    this.chartData$.complete();
    this.database$.complete();

    this.pathways$.complete();
    this.pathwaySelectionChange$.complete();
  }
}

