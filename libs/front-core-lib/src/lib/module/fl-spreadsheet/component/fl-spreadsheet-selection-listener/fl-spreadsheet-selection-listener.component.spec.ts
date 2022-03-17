import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetSelectionListenerComponent} from './fl-spreadsheet-selection-listener.component';

describe('FlSpreadsheetSelectionInputComponent', () => {
  let component: FlSpreadsheetSelectionListenerComponent;
  let fixture: ComponentFixture<FlSpreadsheetSelectionListenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetSelectionListenerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetSelectionListenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
