import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceHistogramComponent} from './biox-resource-histogram.component';

describe('BioxResourceHistogramComponent', () => {
  let component: BioxResourceHistogramComponent;
  let fixture: ComponentFixture<BioxResourceHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceHistogramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
