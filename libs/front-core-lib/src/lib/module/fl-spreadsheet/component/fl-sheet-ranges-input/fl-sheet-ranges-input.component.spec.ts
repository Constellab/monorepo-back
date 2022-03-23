import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSheetRangesInputComponent} from './fl-sheet-ranges-input.component';

describe('FlSpreadsheetRangesInputComponent', () => {
  let component: FlSheetRangesInputComponent;
  let fixture: ComponentFixture<FlSheetRangesInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSheetRangesInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSheetRangesInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
