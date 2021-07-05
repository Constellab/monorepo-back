import {Injectable, OnDestroy} from '@angular/core';
import {FlPathway, FlPathwayDatabase, FlPathwayReactionPathwayDetail} from '../model/fl-pathway.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlChartPathwayData} from '../model/fl-chart-pathway.class';
import {FlChartPathwayFactory} from '../utils/fl-chart-pathway.factory';
import {ClHelpService} from '@monorepo/core-lib';
import {FlPathwayHelper} from '../utils/fl-pathway.helper';
import {map} from 'rxjs/operators';


/**
 * State containing the data for the pathway
 */
@Injectable()
export class FlPathwayState implements OnDestroy {

  private data: FlPathway;
  private chartData$: BehaviorSubject<FlChartPathwayData | null>;
  private database$: BehaviorSubject<FlPathwayDatabase | null>;
  private selectedPathwayIds: string[];

  // used to cache the list of pathway
  private pathwayListCache: Record<FlPathwayDatabase | string, FlPathwayReactionPathwayDetail[]>;

  public init(data: FlPathway, defaultDb: FlPathwayDatabase): void {
    this.data = data;
    this.chartData$ = new BehaviorSubject(null);
    this.database$ = new BehaviorSubject(defaultDb);
    this.selectedPathwayIds = [];
    this.pathwayListCache = {};

    // load the pathway
    const pathwayList: FlPathwayReactionPathwayDetail[] = this.getPathwayList(defaultDb);
    // if there is only one pathway, select it by default
    if (pathwayList.length === 1) {
      this.selectPathways([pathwayList[0].id]);
    }
  }

  // select specific pathway to display
  public selectPathways(pathwayIds: string[]): void {
    this.selectedPathwayIds = pathwayIds;
    // if no ids are selected, we return null
    if (ClHelpService.isNullOrEmpty(pathwayIds) || this.getDatabase() == null) {
      this.chartData$.next(null);
      return;
    }
    // todo check the color
    const chartData: FlChartPathwayData = FlChartPathwayFactory.convertPathwayToChartPathway(this.data, pathwayIds,
      this.getDatabase(), 'grey');

    this.chartData$.next(chartData);
  }

  public getChartData$(): Observable<FlChartPathwayData | null> {
    return this.chartData$.asObservable();
  }

  public getData(): FlPathway {
    return this.data;
  }

  public getSelectedPathwayIds(): string[] {
    return this.selectedPathwayIds;
  }

  // return he list of reactions' pathways
  public getPathwayList$(): Observable<FlPathwayReactionPathwayDetail[]> {
    return this.getDatabase$().pipe(
      map(database => this.getPathwayList(database))
    );
  }

  private getPathwayList(database: FlPathwayDatabase): FlPathwayReactionPathwayDetail[] {
    if (database == null) {
      return [];
    }

    if (this.pathwayListCache[database] == null) {
      this.pathwayListCache[database] = FlPathwayHelper.getSubPathwayList(this.data, database);
    }

    return this.pathwayListCache[database];
  }

  public selectDatabase(database: FlPathwayDatabase): void {
    this.database$.next(database);
  }

  public getDatabase$(): Observable<FlPathwayDatabase> {
    return this.database$.asObservable();
  }

  public getDatabase(): FlPathwayDatabase {
    return this.database$.value;
  }


  ngOnDestroy(): void {
    this.chartData$.complete();
    this.database$.complete();
  }


}

