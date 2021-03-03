import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[flSpreadsheet]'
})
export class FlSpreadsheetDirective implements OnInit {

  @Input() data: Record<string, any>;

  @Output() dataChange: EventEmitter<Record<string, any>> = new EventEmitter<Record<string, any>>();

  constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  ngOnInit(): void {

  }


}
