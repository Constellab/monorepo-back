import {Component, Input, OnInit} from '@angular/core';
import {LabMonitor, LabMonitorBetweenDates} from '../../../model/entities/lab-monitor.entity';
import {
  FlChart2dDatum,
  FlChart2dMultiSerie,
  FlChartAxisTickFormat,
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
    series.addSerie(this.getDiskPercentSeries());
    series.addSerie(this.getRamPercentSeries());
    series.addSerie(this.getSwapPercentSeries());

    // Set x ticks to date format
    series.axisXLabelTicksFormat = this.getXAxisTickFormat();
    this.mainChart = new FlChartLine2d(series);
  }

  private getCpuPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        monitor.cpuPercent, this.formatX(monitor.createdAt));
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.cpu_usage'));
  }

  private getDiskPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.diskUsagePercent,
        this.formatX(monitor.createdAt));
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.disk_usage'));
  }

  private getRamPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.ramUsagePercent,
        this.formatX(monitor.createdAt));
    });
    return new FlChartSerie(data, this.translateService.translate('monitoring.memory_usage'));
  }

  private getSwapPercentSeries(): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(), monitor.swapMemoryPercent,
        this.formatX(monitor.createdAt));
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
    series.axisXLabelTicksFormat = this.getXAxisTickFormat();

    this.allCpuChart = new FlChartLine2d(series);
  }

  private getCpuDetailPercentSeries(cpuIndex: number): FlChartSerie<FlChart2dDatum> {
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        monitor.data.allCpuPercent[cpuIndex] ?? 0,
        this.formatX(monitor.createdAt));
    });
    return new FlChartSerie(data, `CPU ${cpuIndex} (%)`);
  }

  private initNetworkChart(): void {
    const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

    // in network
    const data = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        (monitor.netIoBytesRecv ?? 0) / 1024 / 1024,
        this.formatX(monitor.createdAt),
        FlFileHelper.getFileSizeText(monitor.netIoBytesSent));
    });
    series.addSerie(new FlChartSerie(data,
      this.translateService.translate('monitoring.network_in_mb')));


    // out network
    const data2 = this.monitor.monitors.map((monitor) => {
      return new FlChart2dDatum(monitor.createdAt.valueOf(),
        (monitor.netIoBytesSent ?? 0) / 1024 / 1024,
        this.formatX(monitor.createdAt),
        FlFileHelper.getFileSizeText(monitor.netIoBytesSent));
    });

    series.addSerie(new FlChartSerie(data2,
      this.translateService.translate('monitoring.network_out_mb')));

    // Set x ticks to date format
    series.axisXLabelTicksFormat = this.getXAxisTickFormat();

    this.networkChart = new FlChartLine2d(series);
  }

  private formatX(date: DateTime): string {
    return date.toFormat('yyyy-MM-dd HH:mm:ss');
  }

  private getXAxisTickFormat(): FlChartAxisTickFormat {
    return {
      format: (value: number) => {
        return DateTime.fromMillis(value).toFormat('HH:mm:ss');
      },
      maxLabelLength: 8
    };
  }

}
