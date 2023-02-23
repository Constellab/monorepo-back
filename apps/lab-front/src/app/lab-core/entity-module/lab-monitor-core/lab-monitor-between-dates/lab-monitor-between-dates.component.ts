import {Component, Input, OnInit} from '@angular/core';
import {LabMonitor, LabMonitorBetweenDates} from '../../../model/entities/lab-monitor.entity';
import {
  FlChart2dDatum,
  FlChart2dMultiSerie,
  FlChartLabelFormatter,
  FlChartLine2d,
  FlChartSerie,
  FlFileHelper,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';

@Component({
  selector: 'lab-monitor-between-dates',
  templateUrl: './lab-monitor-between-dates.component.html',
  styleUrls: ['./lab-monitor-between-dates.component.scss']
})
export class LabMonitorBetweenDatesComponent implements OnInit {

  @Input() monitor: LabMonitorBetweenDates;

  lastMonitor?: LabMonitor;

  mainChart: FlChartLine2d;

  allCpuChart: FlChartLine2d;

  networkChart: FlChartLine2d;

  constructor(private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    this.initMainChart();
    this.initAllCpuChart();
    this.initNetworkChart();

    if (this.monitor.monitors.length > 0) {
      this.lastMonitor = this.monitor.monitors[this.monitor.monitors.length - 1];
    }
  }

  private initMainChart(): void {
    const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

    series.addSerie(this.getCpuPercentSeries());
    series.addSerie(this.getOSDiskPercentSeries());
    series.addSerie(this.getLabDiskPercentSeries());
    series.addSerie(this.getRamPercentSeries());
    series.addSerie(this.getSwapPercentSeries());

    // Set x ticks to date format
    series.axisXLabelTicksFormatter = this.getXAxisTickFormat();
    this.mainChart = new FlChartLine2d(series);
  }

  private getCpuPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        monitor.cpuPercent);
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.cpu_usage'));
  }

  private getOSDiskPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.diskUsagePercent);
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.os_disk_usage'));
  }

  private getLabDiskPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.externalDiskUsagePercent);
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.lab_disk_usage'));
  }

  private getRamPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.ramUsagePercent);
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.memory_usage'));
  }

  private getSwapPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.swapMemoryPercent);
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.swap_usage'));
  }

  private initAllCpuChart(): void {
    const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

    if (this.monitor.monitors[0]) {
      const cpuCount = this.monitor.monitors[0].cpuCount;

      for (let i = 0; i < cpuCount; i++) {
        series.addSerie(this.getCpuDetailPercentSeries(i));
      }
    }

    // Set x ticks to date format
    series.axisXLabelTicksFormatter = this.getXAxisTickFormat();

    this.allCpuChart = new FlChartLine2d(series);
  }

  private getCpuDetailPercentSeries(cpuIndex: number): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        monitor.data.allCpuPercent[cpuIndex] ?? 0);
    });
    return new FlChartSerie(data, `CPU ${cpuIndex} (%)`);
  }

  private initNetworkChart(): void {
    const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

    // in network
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        (monitor.netIoBytesRecv ?? 0) / 1024 / 1024);
    });
    series.addSerie(new FlChartSerie(data,
      this.translateService.translate('monitoring.network_in_mb')));


    // out network
    const data2 = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        (monitor.netIoBytesSent ?? 0) / 1024 / 1024);
    });

    series.addSerie(new FlChartSerie(data2,
      this.translateService.translate('monitoring.network_out_mb')));

    // Set tick formatter
    series.axisXLabelTicksFormatter = this.getXAxisTickFormat();
    series.axisYLabelTicksFormatter = new FlChartLabelFormatter(
      (value: number) => FlFileHelper.getFileSizeText(value),
      10
    );


    this.networkChart = new FlChartLine2d(series);
  }


  private getXAxisTickFormat(): FlChartLabelFormatter {
    return new FlChartLabelFormatter(
      (value: number) => DateTime.fromMillis(value).toFormat('HH:mm:ss'),
      8,
      (value: number) => DateTime.fromMillis(value).toFormat('yyyy-MM-dd HH:mm:ss')
    );
  }

}
