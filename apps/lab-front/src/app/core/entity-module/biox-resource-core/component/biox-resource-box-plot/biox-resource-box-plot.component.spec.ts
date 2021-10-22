import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceBoxPlotComponent} from './biox-resource-box-plot.component';

describe('BioxResourceBoxPlotComponent', () => {
  let component: BioxResourceBoxPlotComponent;
  let fixture: ComponentFixture<BioxResourceBoxPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceBoxPlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceBoxPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
