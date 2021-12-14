import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchDateIntervalComponent} from './fl-search-date-interval.component';

describe('FlSearchDateIntervalComponent', () => {
  let component: FlSearchDateIntervalComponent;
  let fixture: ComponentFixture<FlSearchDateIntervalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchDateIntervalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchDateIntervalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
