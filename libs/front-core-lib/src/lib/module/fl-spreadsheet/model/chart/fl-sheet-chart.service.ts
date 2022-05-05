import {Observable} from 'rxjs';
import {FlSheetChart2dSerieSelectionForm, FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';


export abstract class FlSheetChartService {


  public abstract generateLine2d(series: FlSheetChart2dSerieSelectionForm[],
                                 contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[],
                                        contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateHistogram(series: FlSheetChartSerieSelectionForm[],
                                    nbOfBins?: number, density?: boolean,
                                    contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateBoxPlot(series: FlSheetChartSerieSelectionForm[],
                                  contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateBar(series: FlSheetChartSerieSelectionForm[],
                              contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateStackBar(series: FlSheetChartSerieSelectionForm[], normalize: boolean,
                                   contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateHeatMap(serie: FlSheetChartSerieSelectionForm,
                                  contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;

  public abstract generateVennDiagram(series: FlSheetChartSerieSelectionForm[],
                                      contextMenuItems?: FlMenuDynamic[]): FlOverlayRef | Observable<FlOverlayRef>;
}
