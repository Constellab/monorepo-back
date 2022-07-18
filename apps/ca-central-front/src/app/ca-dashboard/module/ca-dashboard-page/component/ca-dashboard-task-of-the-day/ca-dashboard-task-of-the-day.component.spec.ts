import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardTaskOfTheDayComponent} from './ca-dashboard-task-of-the-day.component';

describe('CaDashboardTaskOfTheDayComponent', () => {
  let component: CaDashboardTaskOfTheDayComponent;
  let fixture: ComponentFixture<CaDashboardTaskOfTheDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaDashboardTaskOfTheDayComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardTaskOfTheDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
