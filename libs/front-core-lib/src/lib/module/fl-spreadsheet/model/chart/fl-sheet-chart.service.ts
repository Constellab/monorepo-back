import {Observable} from 'rxjs';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetChart2dSerieSelectionForm, FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';


export abstract class FlSheetChartService {


  public abstract generateLine2d(series: FlSheetChart2dSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateHistogram(serie: FlSheetChartSerieSelectionForm,
                                    nbOfBins?: number): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateBoxPlot(series: FlSheetChartSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateBar(series: FlSheetChartSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateStackBar(series: FlSheetChartSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;

  public abstract generateHeatMap(serie: FlSheetChartSerieSelectionForm): FlChartConfig | Observable<FlChartConfig>;

  // todo a voir
  public abstract generateVennDiagram(series: FlSheetChartSerieSelectionForm[]): FlChartConfig | Observable<FlChartConfig>;
}
