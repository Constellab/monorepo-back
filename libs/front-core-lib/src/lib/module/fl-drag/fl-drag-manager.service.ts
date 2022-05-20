import {Injectable} from '@angular/core';
import {FlDragData} from './fl-drag.class';

@Injectable({
  providedIn: 'root'
})
export class FlDragManagerService {

  private draggedData: FlDragData;

  constructor() {
  }

  public setDraggedData(type: string, data: any): void {
    this.draggedData = {
      type: type,
      data: data
    };
  }

  public hasDataWithType(type: string): boolean {
    return this.draggedData?.type === type;
  }

  public getData(): any {
    return this.draggedData?.data ?? null;
  }

  public getDataWithType(type: string): any {
    if (this.hasDataWithType(type)) {
      return this.getData();
    }
    return null;
  }
}
