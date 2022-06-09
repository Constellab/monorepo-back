import {Injectable, OnDestroy} from '@angular/core';
import {
  FlBioNetwork,
  FlBioNetworkCluster,
  FlBioNetworkClusterGroupSelection,
  FlBioNetworkPathwaySelection,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlBioNetworkFactory} from '../utils/fl-bio-network.factory';
import {ClHelpService} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from '../utils/fl-bio-network.helper';
import {debounceTime, map} from 'rxjs/operators';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {FlFileHelper} from '../../../service/fl-file.helper';
import {FlBioNetworkCompartment, flBioNetworkCompartments} from '../model/fl-bio-network-compartment.class';


/**
 * State containing the data for the pathway
 */
@Injectable()
export class FlBioNetworkState implements OnDestroy {

  public networks: FlBioNetwork[];
  private selectedNetwork$: BehaviorSubject<FlBioNetwork | null>;
  private chartData$: BehaviorSubject<FlBioNetworkD3 | null>;
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
    this.database$ = new BehaviorSubject(null);
    this.pathways$ = new BehaviorSubject([]);
    this.pathwaySelectionChange$ = new BehaviorSubject(null);

    this.pathwayListCache = {};

    // load the db and the list of pathways
    this.selectDatabase(defaultDb);

    this.pathwaySelectionChange$.pipe(
      // use a debounce time to prevent rebuilding the graph to much
      debounceTime(500)
    ).subscribe(
      () => this.selectPathways(this.pathways$.value)
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

  /////////////////////////////////////// NETWORKS /////////////////////////////////////////

  public selectNetwork(name: string): void {
    // find the network with the name
    const network: FlBioNetwork = this.networks.find(network => network.name === name);
    this.selectedNetwork$.next(network);
    this.pathways$.next([]);
    this.emitPathwaySelectionChange();
  }

  public getSelectedNetwork(): FlBioNetwork {
    return this.selectedNetwork$.value;
  }

  /////////////////////////////////////// DATABASE  /////////////////////////////////////////

  public selectDatabase(database: FlPathwayDatabase): void {
    this.database$.next(database);

    // todo remove pathway selection
    // const pathwayList: FlBioNetworkPathwaySelection[] = this.getPathwayList(database);
    // this.pathways$.next(pathwayList);

    const clusterList: FlBioNetworkPathwaySelection[] = this.getClustersList();
    this.pathways$.next(clusterList);

    console.log(this.getClustersGroup());


    // if there is only one pathway, select it by default
    if (clusterList.length === 1) {
      this.selectPathways([clusterList[0]]);
    }

    this.emitPathwaySelectionChange();
  }

  public getDatabase$(): Observable<FlPathwayDatabase> {
    return this.database$.asObservable();
  }

  public getDatabase(): FlPathwayDatabase {
    return this.database$.value;
  }

  /////////////////////////////////////// PATHWAYS  /////////////////////////////////////////

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
    const chartData: FlBioNetworkD3 = new FlBioNetworkFactory(this.themeService.getCurrentThemeDetail())
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

  private getClustersList(): FlBioNetworkPathwaySelection[] {
    if (this.getSelectedNetwork() == null) {
      return [];
    }

    const network = this.getSelectedNetwork();
    const clusters: FlBioNetworkPathwaySelection[] = [];


    clusters.push({
      id: FlBioNetworkHelper.defaultClusterId,
      name: FlBioNetworkHelper.defaultClusterId,
      color: FlColorHelper.stringToRGBColor(FlBioNetworkHelper.defaultClusterId),
      highlighted: false,
      selected: false,
    });
    for (const metabolite of network.metabolites) {
      for (const cluster of Object.values(metabolite.layout.clusters)) {
        if (clusters.find(c => c.id === cluster.parent) == null) {
          clusters.push({
            id: cluster.parent,
            name: cluster.parent,
            selected: false,
            highlighted: false,
            color: FlColorHelper.stringToRGBColor(cluster.parent)
          });
        }
      }
    }


    return clusters;
  }

  private getClustersGroup(): FlBioNetworkClusterGroupSelection[] {
    const network = this.getSelectedNetwork();
    if (network == null) {
      return [];
    }
    const groups: FlBioNetworkClusterGroupSelection[] = [];

    for (const metabolite of network.metabolites) {

      for (const clusterName of Object.keys(metabolite.layout.clusters)) {
        const cluster: FlBioNetworkCluster = metabolite.layout.clusters[clusterName];
        let parent = groups.find(g => g.name === cluster.parent);
        if (parent == null) {
          parent = {
            name: cluster.parent,
            children: [],
          };
          groups.push(parent);
        }

        const child = parent.children.find(c => c.name === clusterName);
        if (child == null) {
          parent.children.push({name: clusterName});
        }
      }
    }

    return groups;
  }


  public emitPathwaySelectionChange(): void {
    this.pathwaySelectionChange$.next();
  }

  public getPathways$(): Observable<FlBioNetworkPathwaySelection[]> {
    return this.pathways$.asObservable();
  }

  public getClusters$(): Observable<FlBioNetworkPathwaySelection[]> {
    return this.pathways$.asObservable();
  }

  public getCurrentPathways(): FlBioNetworkPathwaySelection[] {
    return this.pathways$.value;
  }


  /////////////////////////////////////// CHART DATA /////////////////////////////////////////
  public getChartData$(): Observable<FlBioNetworkD3 | null> {
    return this.chartData$.asObservable();
  }

  public getCurrentChartData(): FlBioNetworkD3 | null {
    return this.chartData$.value;
  }

  public downloadNetworkJson(): void {
    const network: FlBioNetwork = this.exportAllNetwork();

    // TODO to remove, this is temporary to export a view object
    const viewObject = {
      type: 'network-view',
      data: network
    };

    FlFileHelper.downloadJsonFile(viewObject, 'network.json');
  }

  public exportAllNetwork(): FlBioNetwork {
    return this.getSelectedNetwork();
  }


  /////////////////////////////////////// OTHER /////////////////////////////////////////

  public getCompartments$(): Observable<FlBioNetworkCompartment[]> {
    return this.selectedNetwork$.pipe(
      map(network => {
        const compartments: FlBioNetworkCompartment[] = [];
        for (const key of Object.keys(network.compartments)) {
          const compartment = flBioNetworkCompartments.find(c => c.id === key);
          if (compartment) {
            compartments.push(compartment);
          }
        }
        return compartments;
      })
    );
  }

  ngOnDestroy(): void {
    this.selectedNetwork$.complete();
    this.chartData$.complete();
    this.database$.complete();

    this.pathways$.complete();
    this.pathwaySelectionChange$.complete();
  }
}

