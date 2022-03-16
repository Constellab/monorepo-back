import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSheetMultiSelection} from '../../model/selection/fl-sheet-multi-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionForm,
  FlSheetChartSelectionFormAdditional,
  FlSheetChartSelectionResult,
  FlSheetChartSerieSelectionForm,
  FlSpreadsheetChartSelectionInput,
  FlSpreadsheetChartSelectionInputCreate,
  FlSpreadsheetChartSelectionInputUpdate
} from '../../model/chart/fl-sheet-chart-selection-form.class';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {
  FlSpreadsheetChartSerieSelectionComponent,
} from '../fl-spreadsheet-chart-serie-selection/fl-spreadsheet-chart-serie-selection.component';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';
import {debounceTime, skip} from 'rxjs/operators';
import {merge} from 'rxjs';
import {
  FlSpreadsheetChartSelectionHelper,
  FlSpreadsheetChartSerieSelectionInput,
  FlSpreadsheetSplitSelectionMode
} from '../../utils/fl-spreadsheet-chart-selection.helper';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';
import {flChartGetDefaultNumberOfBins} from '../../../fl-chart/model/data/fl-chart-data-bin.class';
import {ThemePalette} from '@angular/material/core';
import {
  FlSheetBasic2dPlotFormConfig,
  FlSheetChartFormConfig,
  FlSheetHeatMapFormConfig,
  FlSheetHistogramFormConfig,
  FlSheetLinePlotFormConfig,
  FlSheetScatterPlotFormConfig,
  FlSheetVennDiagramFormConfig
} from '../../model/chart/fl-sheet-chart-form-config.class';


/**
 * Modal component to select value from the excel to draw a chart
 */
@Component({
  selector: 'fl-spreadsheet-chart-selection',
  templateUrl: './fl-spreadsheet-chart-selection.component.html',
  styleUrls: ['./fl-spreadsheet-chart-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetChartSelectionComponent implements OnInit, OnDestroy {

  formGp: FormGroup<FlSheetChartSelectionForm>;

  input: FlSpreadsheetChartSelectionInput;

  // nb max of series supported
  ngMaxOfSeries: number = Infinity;

  submitted: boolean = false;

  private readonly hideElementClass: string = 'g-hide-element';

  private formConfig: FlSheetChartFormConfig;

  private subscriptions: ClSubscriptionHandler = new ClSubscriptionHandler();

  // use to change the select split into series
  splitSelection: FlSpreadsheetSplitSelectionMode = 'column';

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
      dataRange: [null, [
        FlSpreadsheetChartSelectionHelper.multipleSelectionValidator(this.state.spreadsheet),
      ]],
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
      this.formGp.get('dataRange').patchValue(input.currentSelection.toString());
    }
  }

  private initUpdate(input: FlSpreadsheetChartSelectionInputUpdate): void {
    this.formGp.patchValue(input.selection);
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

    // subscribe to serie change to refresh data based on series
    this.subscriptions.add(
      this.formGp.get('series').valueChanges.pipe().subscribe(
        () => this.refreshFormOnSeriesChange()
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
    if (this.formGp.valid) {
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

    this.portalService.createPortal(FlSpreadsheetChartSerieSelectionComponent, portalConfig, data).detachments().subscribe(
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
    const dataRange: string = this.formGp.get('dataRange').value;

    if (ClHelpService.isNullOrEmpty(chartType) || ClHelpService.isNullOrEmpty(dataRange)
      || this.formGp.get('dataRange').invalid) {
      return;
    }

    const dataSelection: FlSheetMultiSelection = this.getMultiSelectionFromString(dataRange);
    // todo see how to handle serie name
    const series: FlSheetChart2dSerieSelectionForm[] = this.formConfig.createSeriesFromDataRange(dataSelection, this.splitSelection);

    this.formGp.get('series').patchValue(series);
    this.cdr.markForCheck();
  }

  // method call when the series a changes, it refreshes the form information
  private refreshFormOnSeriesChange(): void {
    if (this.chartType === FlChartType.HISTOGRAM) {
      this.initNbOfBins();
    }
  }

  // for the histogram, it set the number of bins based on nb of values
  private initNbOfBins(): void {
    const serie: FlSheetChartSerieSelectionForm = this.series[0];
    const selection = this.getMultiSelectionFromString(serie.y);

    if (selection) {
      this.formGp.get('additionalFields').get('nbOfBins').patchValue(flChartGetDefaultNumberOfBins(selection.getCellsValuesFlat().length));
    }
  }

  private getMultiSelectionFromString(selection: string): FlSheetMultiSelection {
    return !ClHelpService.isNullOrEmpty(selection) ? FlSheetMultiSelection.fromString(this.state.currentSheet, selection) : null;
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

  toggleSplitSelection(): void {
    this.splitSelection = this.splitSelection === 'row' ? 'column' : 'row';
    this.createSerieFromDataRange();
  }

  get splitButtonColor(): ThemePalette {
    return this.splitSelection === 'row' ? 'primary' : null;
  }

  get splitButtonTooltip(): string {
    return this.splitSelection === 'row' ? 'flSpreadsheet.split_selection_by_columns' : 'flSpreadsheet.split_selection_by_rows';
  }

  private getConfigForChartType(chartType: FlChartType): FlSheetChartFormConfig {
    switch (chartType) {
      case FlChartType.BAR_PLOT:
      case FlChartType.STACKED_PLOT:
      case FlChartType.BOX_PLOT:
        return new FlSheetBasic2dPlotFormConfig();
      case FlChartType.SCATTER_PLOT:
        return new FlSheetScatterPlotFormConfig();
      case FlChartType.LINE:
        return new FlSheetLinePlotFormConfig();
      case FlChartType.VENN_DIAGRAM:
        return new FlSheetVennDiagramFormConfig();
      case FlChartType.HEAT_MAP:
        return new FlSheetHeatMapFormConfig();
      case FlChartType.HISTOGRAM:
        return new FlSheetHistogramFormConfig();
      default:
        throw Error(`[FlSpreadsheetChartSelectionComponent] Config not defined for chart type : '${chartType}'`);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
