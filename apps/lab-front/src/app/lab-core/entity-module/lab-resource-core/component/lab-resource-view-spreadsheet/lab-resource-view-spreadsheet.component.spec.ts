import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewSpreadsheetComponent} from './lab-resource-view-spreadsheet.component';

describe('BioxResourceSpreadsheetComponent', () => {
  let component: LabResourceViewSpreadsheetComponent;
  let fixture: ComponentFixture<LabResourceViewSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
