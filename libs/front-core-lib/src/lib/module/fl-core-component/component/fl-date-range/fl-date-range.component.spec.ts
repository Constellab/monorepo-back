import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDateRangeComponent} from './fl-date-range.component';

describe('DateRangeComponent', () => {
  let component: FlDateRangeComponent;
  let fixture: ComponentFixture<FlDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDateRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
