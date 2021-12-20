import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceSpreadsheetComponent} from './lab-resource-spreadsheet.component';

describe('BioxResourceSpreadsheetComponent', () => {
  let component: LabResourceSpreadsheetComponent;
  let fixture: ComponentFixture<LabResourceSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
