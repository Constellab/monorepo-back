import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionForm,
  FlSheetChartSelectionFormAdditional,
  FlSheetChartSelectionResult,
  FlSheetSelectionRange,
  FlSpreadsheetChartSelectionInput,
  FlSpreadsheetChartSelectionInputCreate,
  FlSpreadsheetChartSelectionInputUpdate
} from '../../model/chart/fl-sheet-chart-selection-form.class';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {
  FlSheetChartSerieSelectionComponent,
} from '../fl-sheet-chart-serie-selection/fl-sheet-chart-serie-selection.component';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';
import {debounceTime, skip} from 'rxjs/operators';
import {merge} from 'rxjs';
import {FlSpreadsheetChartSelectionHelper,} from '../../utils/fl-spreadsheet-chart-selection.helper';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';
import {
  FlSheetBasic2dPlotFormConfig,
  FlSheetChartFormConfig,
  FlSheetHeatMapFormConfig,
  FlSheetHistogramFormConfig,
  FlSheetLinePlotFormConfig,
  FlSheetScatterPlotFormConfig,
  FlSheetVennDiagramFormConfig,
  FlSpreadsheetChartSerieSelectionInput
} from '../../model/chart/fl-sheet-chart-form-config.class';


/**
 * Modal component to select value from the spreadsheet to draw a chart
 */
@Component({
  selector: 'fl-sheet-chart-selection',
  templateUrl: './fl-sheet-chart-selection.component.html',
  styleUrls: ['./fl-sheet-chart-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSheetChartSelectionComponent implements OnInit, OnDestroy {

  formGp: FormGroup<FlSheetChartSelectionForm>;

  input: FlSpreadsheetChartSelectionInput;

  // nb max of series supported
  ngMaxOfSeries: number = Infinity;

  submitted: boolean = false;

  private readonly hideElementClass: string = 'g-hide-element';

  private formConfig: FlSheetChartFormConfig;

  private subscriptions: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private state: FlSpreadsheetState,
              @Inject(FL_PORTAL_DATA) input: FlSpreadsheetChartSelectionInput,
              private portalService: FlPortalService,
              private overlayRef: FlOverlayRef,
              private translate: FlTranslateService,
              private cdr: ChangeDetectorRef) {
    this.input = input;
  }

  ngOnInit(): void {
    // subscribe to sheet change and clear the form on change to secure data
    // because selection does not support multi sheet
    this.subscriptions.add(
      this.state.currentSheet$.pipe(skip(1)).subscribe(
        () => this.resetForm()
      )
    );

    this.initForm();


    // add a timeout before the listen to prevent event from being fired
    // on patch during init
    setTimeout(() => {
      this.listenToChanges();
    }, 0);
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      chartType: [null, [
        Validators.required,
      ]],
      dataRange: [null],
      series: [[], Validators.required],
      additionalFields: new FormBuilder().group({
        nbOfBins: [null, [Validators.min(1), FlGlobalValidators.isInteger()]],
      })

    });

    if (this.input.mode === 'create') {
      this.initCreate(this.input);
    } else {
      this.initUpdate(this.input);
    }
  }

  private initCreate(input: FlSpreadsheetChartSelectionInputCreate): void {
    if (input.currentSelection) {
      this.formGp.get('dataRange').patchValue(input.currentSelection.toFlSheetSelectionRange());
    }
  }

  private initUpdate(input: FlSpreadsheetChartSelectionInputUpdate): void {
    this.formGp.patchValue(input.selection);
    this.onChartTypeChange(input.selection.chartType);
  }

  private listenToChanges(): void {
    // subscribe to chart type
    this.subscriptions.add(
      this.formGp.get('chartType').valueChanges.subscribe(
        (chartType) => this.onChartTypeChange(chartType)
      )
    );

    // subscribe to chart type and data range change to create series based on data range
    this.subscriptions.add(
      merge(this.formGp.get('chartType').valueChanges, this.formGp.get('dataRange').valueChanges).pipe(
        debounceTime(100)
      ).subscribe(
        () => this.createSerieFromDataRange()
      )
    );
  }


  submit(): void {
    this.validateForm(this.input.mode);
  }

  createNewChart(): void {
    this.validateForm('create');
  }


  private validateForm(mode: 'create' | 'update'): void {
    this.submitted = true;
    if (this.formGp.valid && !this.maxNbOfSeriesReached) {
      const value: FlSheetChartSelectionForm = this.formGp.value;
      // if we are in create mode we create a new id
      if (mode === 'create') {
        value.id = Symbol();
      }

      const result: FlSheetChartSelectionResult = {
        selection: value,
        mode: mode
      };
      this.overlayRef.dispose(result);
    }
  }

  private onChartTypeChange(chartType: FlChartType): void {
    if (chartType == null) return;
    this.formConfig = this.getConfigForChartType(chartType);

    this.ngMaxOfSeries = this.formConfig.getNbMaxOfSeries();

    // limit the size of the series
    if (this.series.length >= this.ngMaxOfSeries) {
      this.formGp.get('series').patchValue(this.series.slice(0, this.ngMaxOfSeries));
    }
  }

  get series(): FlSheetChart2dSerieSelectionForm[] {
    return this.formGp.get('series').value;
  }

  get chartType(): FlChartType {
    return this.formGp.get('chartType').value;
  }

  showAdditionalField(key: keyof FlSheetChartSelectionFormAdditional): boolean {
    if (this.formConfig == null) return false;
    return this.formConfig.getAdditionalFieldsName().includes(key);
  }

  addSerie(): void {
    const serie: FlSheetChart2dSerieSelectionForm = {
      name: FlSpreadsheetChartSelectionHelper.getDefaultSerieName(this.series.length),
      y: null,
      x: null
    };

    this.openSerieSelection(serie);

  }

  updateSerie(serie: FlSheetChart2dSerieSelectionForm, index: number): void {
    this.openSerieSelection(serie, index);
  }

  deleteSerie(index: number): void {
    // get the series and remove the element
    const series = this.series;
    series.splice(index, 1);
    this.formGp.get('series').patchValue(series);
  }

  private openSerieSelection(serie: FlSheetChart2dSerieSelectionForm, index?: number): void {
    const data: FlSpreadsheetChartSerieSelectionInput = this.formConfig.getSelectSerieConfig(serie);

    // use the top 0 to make the portal appear on top (otherwise it takes all the height)
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal({centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true
      });

    this.portalService.createPortal(FlSheetChartSerieSelectionComponent, portalConfig, data).detachments().subscribe(
      (newSerie) => this.onSerieUpdated(newSerie, index)
    );

    // hide the current portal during serie selection
    this.hideOverlay();
  }


  private onSerieUpdated(serie ?: FlSheetChart2dSerieSelectionForm, index?: number): void {
    // reshow the portal after serie selection
    this.showOverlay();
    if (serie) {
      const series = this.series;
      // updated serie
      if (index != null) {
        series[index] = serie;
        // new serie
      } else {
        series.push(serie);
      }

      this.formGp.get('series').patchValue([...series]);
      this.cdr.markForCheck();
    }
  }

  private hideOverlay(): void {
    this.overlayRef.overlayRef.addPanelClass(this.hideElementClass);
  }

  private showOverlay(): void {
    this.overlayRef.overlayRef.removePanelClass(this.hideElementClass);
  }

  // create the series base on main data selection
  private createSerieFromDataRange(): void {
    const chartType: FlChartType = this.formGp.get('chartType').value;
    const dataRange: FlSheetSelectionRange = this.formGp.get('dataRange').value;

    if (ClHelpService.isNullOrEmpty(chartType) || ClHelpService.isNullOrEmpty(dataRange)
      || this.formGp.get('dataRange').invalid) {
      return;
    }

    const series: FlSheetChart2dSerieSelectionForm[] = this.formConfig.createSeriesFromDataRange(dataRange);

    this.formGp.get('series').patchValue(series);
    this.cdr.markForCheck();
  }

  private resetForm(): void {
    this.formGp?.reset({
      series: []
    });
    this.ngMaxOfSeries = Infinity;
  }

  get submitTextButton(): string {
    return this.input.mode === 'create' ? 'flSpreadsheet.create_chart' : 'flSpreadsheet.update_chart';
  }

  private getConfigForChartType(chartType: FlChartType): FlSheetChartFormConfig {
    const sheet = this.state.currentSheet;
    switch (chartType) {
      case FlChartType.BAR_PLOT:
      case FlChartType.STACKED_PLOT:
      case FlChartType.BOX_PLOT:
        return new FlSheetBasic2dPlotFormConfig(sheet);
      case FlChartType.SCATTER_PLOT:
        return new FlSheetScatterPlotFormConfig(sheet);
      case FlChartType.LINE:
        return new FlSheetLinePlotFormConfig(sheet);
      case FlChartType.VENN_DIAGRAM:
        return new FlSheetVennDiagramFormConfig(sheet);
      case FlChartType.HEAT_MAP:
        return new FlSheetHeatMapFormConfig(sheet);
      case FlChartType.HISTOGRAM:
        return new FlSheetHistogramFormConfig(sheet);
      default:
        throw Error(`[FlSpreadsheetChartSelectionComponent] Config not defined for chart type : '${chartType}'`);
    }
  }

  get maxNbOfSeries(): number{
    return this.formConfig?.getNbMaxOfSeries() ?? Infinity;
  }

  get maxNbOfSeriesReached(): boolean{
    return this.formGp.value.series.length > this.maxNbOfSeries
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
