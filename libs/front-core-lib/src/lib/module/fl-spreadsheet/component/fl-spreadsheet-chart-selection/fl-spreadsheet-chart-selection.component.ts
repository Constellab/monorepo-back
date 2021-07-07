import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';
import {FlSheetSingleSelection, FlSheetSingleSelectionFull} from '../../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';
import {FlSheetMultiSelection} from '../../model/selection/fl-sheet-multi-selection.class';
import {FlSheet} from '../../model/fl-sheet.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionForm,
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
  FlSpreadsheetChartSerieSelectionInput
} from '../fl-spreadsheet-chart-serie-selection/fl-spreadsheet-chart-serie-selection.component';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {ClHelpService, clRxjsDebug, ClSubscriptionHandler} from '@monorepo/core-lib';
import {debounceTime} from 'rxjs/operators';
import {merge} from 'rxjs';
import {FlSpreadsheetChartSelectionFactory} from '../../utils/fl-spreadsheet-chart-selection.factory';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';
import {flChartGetDefaultNumberOfBins} from '../../../fl-chart/model/data/fl-chart-data-bin.class';


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


  private readonly hideElementClass: string = 'g-hide-element';

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
    this.initForm();


    // add a timeout before the listen to prevent event from being fired
    // on patch during init
    setTimeout(() => {
      this.listenToChanges();
    }, 0);
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      chartType: [null, [
        Validators.required,
      ]],
      dataRange: [null, [
        this.multipleSelectionValidator(),
      ]],
      seriesNameRange: [null, [
        this.singleSelectionValidator(),
      ]],
      series: [[], Validators.required],
      nbOfBins: [null, [Validators.min(1), FlGlobalValidators.isInteger()]],

    });

    if (this.input.mode === 'create') {
      this.initCreate(this.input);
    } else {
      this.initUpdate(this.input);
    }
  }

  private initCreate(input: FlSpreadsheetChartSelectionInputCreate): void {
    if (input.currentSelection) {
      // convert to multiple selection, one for each row
      const selections: FlSheetMultiSelection = new FlSheetMultiSelection(input.currentSelection.splitToColumnSelections());
      this.formGp.get('dataRange').patchValue(selections.toString());
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
        debounceTime(100), clRxjsDebug('dataRange')
      ).subscribe(
        () => this.createSerieFromDataRange()
      )
    );

    // subscribe to serie name range change to update series' names
    this.subscriptions.add(
      this.formGp.get('seriesNameRange').valueChanges
        .pipe(debounceTime(100), clRxjsDebug('Name'))
        .subscribe(
          () => this.setSeriesNames()
        )
    );

    // subscribe to serie change to refresh data based on series
    this.subscriptions.add(
      this.formGp.get('series').valueChanges
        .pipe(clRxjsDebug('Serie')).subscribe(
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
    if (this.formGp.valid) {
      const value: FlSheetChartSelectionForm = this.formGp.value;

      const result: FlSheetChartSelectionResult = {
        selection: value,
        mode: mode
      };
      this.overlayRef.dispose(result);
    }
  }

  private onChartTypeChange(chartType: FlChartType): void {
    this.ngMaxOfSeries = chartType === FlChartType.HISTOGRAM ? 1 : Infinity;

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

  get showNbOfBins(): boolean {
    return this.chartType === FlChartType.HISTOGRAM;
  }

  addSerie(): void {
    const serie: FlSheetChart2dSerieSelectionForm = {
      name: this.getDefaultSerieName(this.series.length),
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
    const data: FlSpreadsheetChartSerieSelectionInput = {
      mode: FlSpreadsheetChartSelectionFactory.getSelectSerieMode(this.chartType),
      serie: serie
    };

    // use the top 0 to make the portal appear on top (otherwise it take all the height)
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal({centerHorizontally: '0', top: '0'},
      {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true
      });

    this.portalService.createPortal(FlSpreadsheetChartSerieSelectionComponent, portalConfig, data)
      .detachments().subscribe(
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

    if (ClHelpService.isNullOrEmpty(chartType) || ClHelpService.isNullOrEmpty(dataRange)) {
      return;
    }

    const dataSelection: FlSheetMultiSelection = this.getMultiSelectionFromString(dataRange);
    const serieNames: string[] = this.getSerieNameSelectionValues();
    const series: FlSheetChart2dSerieSelectionForm[] =
      FlSpreadsheetChartSelectionFactory.createSerieFromDataRange(chartType, dataSelection, serieNames);

    this.formGp.get('series').patchValue(series);
    this.cdr.markForCheck();
  }

  // method call when the series a changes, it refresh the form information
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
      this.formGp.get('nbOfBins').patchValue(flChartGetDefaultNumberOfBins(selection.getCellsValuesFlat().length));
    }
  }

  // set the name for all the current series bases on series' name range
  private setSeriesNames(): void {
    const series = this.series;
    const serieNames: string[] = this.getSerieNameSelectionValues();

    for (let i = 0; i < series.length; i++) {
      series[i].name = FlSpreadsheetChartSelectionFactory.getSerieNameAtIndex(i, serieNames);
    }

    this.cdr.detectChanges();
  }

  // return the default name for a new serie
  // if the serie's name selection is defined, use it for the name
  // otherwise choose a default name
  private getDefaultSerieName(index: number): string {
    const serieNames: string[] = this.getSerieNameSelectionValues();

    return FlSpreadsheetChartSelectionFactory.getSerieNameAtIndex(index, serieNames);
  }


  // return the cells values of the series' name range
  private getSerieNameSelectionValues(): string[] | null {
    const serieNames: string = this.formGp.get('seriesNameRange').value;
    if (serieNames != null) {
      const seriesNameSelection: FlSheetSingleSelection = this.getSingleSelectionFromString(serieNames);

      return seriesNameSelection.getCellsValuesFlat();
    }

    return null;
  }

  private getSingleSelectionFromString(selection: string): FlSheetSingleSelection {
    return !ClHelpService.isNullOrEmpty(selection) ? FlSheetSingleSelectionFull.fromString(this.state.currentSheet, selection) : null;
  }

  private getMultiSelectionFromString(selection: string): FlSheetMultiSelection {
    return !ClHelpService.isNullOrEmpty(selection) ? FlSheetMultiSelection.fromString(this.state.currentSheet, selection) : null;
  }

  /**
   * Validator to check single selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound (pass the name of the coord problem)
   * @private
   */
  private singleSelectionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForSingleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = this.state.currentSheet;

      const selection: FlSheetSingleSelection = FlSheetSingleSelectionFull.fromString(sheet, control.value);

      if (!sheet.coordIsValid(selection.from)) {
        return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.from)};
      }

      if (!sheet.coordIsValid(selection.to)) {
        return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.to)};
      }

      return null;

    };
  }


  /**
   * Validator to check multiple selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound
   * @private
   */
  private multipleSelectionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForMultipleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = this.state.currentSheet;

      const selections: FlSheetMultiSelection = FlSheetMultiSelection.fromString(sheet, control.value);

      for (const selection of selections.selections) {
        if (!sheet.coordIsValid(selection.from)) {
          return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.from)};
        }

        if (!sheet.coordIsValid(selection.to)) {
          return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.to)};
        }
      }

      return null;

    };
  }

  get submitTextButton(): string {
    return this.input.mode === 'create' ? 'flSpreadsheet.create_chart' : 'flSpreadsheet.update_chart';
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
