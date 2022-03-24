import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetHeaderTagsComponent} from './fl-spreadsheet-header-tags.component';

describe('FlSpreadsheetHeaderTagsComponent', () => {
  let component: FlSpreadsheetHeaderTagsComponent;
  let fixture: ComponentFixture<FlSpreadsheetHeaderTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetHeaderTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetHeaderTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
