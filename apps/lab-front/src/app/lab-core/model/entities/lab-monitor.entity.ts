import {Expose, Type} from 'class-transformer';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {LabBaseEntity} from '../global/lab-entity.entity';


export class LabMonitorData {

  @Expose({name: 'all_cpu_percent'})
  allCpuPercent: number[];
}

export class LabMonitor extends LabBaseEntity{


  @Expose({name: 'cpu_count'})
  cpuCount: number;

  @Expose({name: 'cpu_percent'})
  cpuPercent: number;

  @Expose({name: 'disk_total'})
  diskTotal: number;

  @Expose({name: 'disk_usage_used'})
  diskUsageUsed: number;

  @Expose({name: 'disk_usage_free'})
  diskUsageFree: number;

  @Expose({name: 'disk_usage_percent'})
  diskUsagePercent: number;

  @Expose({name: 'external_disk_total'})
  externalDiskTotal: number;

  @Expose({name: 'external_disk_usage_used'})
  externalDiskUsageUsed: number;

  @Expose({name: 'external_disk_usage_free'})
  externalDiskUsageFree: number;

  @Expose({name: 'external_disk_usage_percent'})
  externalDiskUsagePercent: number;

  @Expose({name: 'swap_memory_total'})
  swapMemoryTotal: number;

  @Expose({name: 'swap_memory_used'})
  swapMemoryUsed: number;

  @Expose({name: 'swap_memory_free'})
  swapMemoryFree: number;

  @Expose({name: 'swap_memory_percent'})
  swapMemoryPercent: number;

  @Expose({name: 'net_io_bytes_sent'})
  netIoBytesSent: number;

  @Expose({name: 'net_io_bytes_recv'})
  netIoBytesRecv: number;

  @Expose({name: 'ram_usage_total'})
  ramUsageTotal: number;

  @Expose({name: 'ram_usage_used'})
  ramUsageUsed: number;

  @Expose({name: 'ram_usage_free'})
  ramUsageFree: number;

  @Expose({name: 'ram_usage_percent'})
  ramUsagePercent: number;

  @Expose({name: 'data'})
  @Type(() => LabMonitorData)
  data: LabMonitorData;
}

export class LabMonitorBetweenDates{

  @Expose({name: 'from_date'})
  @ClLuxonDateTimeTransform()
  fromDate: Date;

  @Expose({name: 'to_date'})
  @ClLuxonDateTimeTransform()
  toDate: Date;

  @Type(() => LabMonitor)
  monitors: LabMonitor[];
}
