import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardActivityCardComponent} from './ca-dashboard-activity-card.component';

describe('CaDashboardActivityCardComponent', () => {
  let component: CaDashboardActivityCardComponent;
  let fixture: ComponentFixture<CaDashboardActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaDashboardActivityCardComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
