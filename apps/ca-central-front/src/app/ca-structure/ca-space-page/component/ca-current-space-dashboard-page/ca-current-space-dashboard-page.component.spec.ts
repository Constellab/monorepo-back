import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceDashboardPageComponent} from './ca-current-space-dashboard-page.component';

describe('CaCurrentSpaceDashboardPageComponent', () => {
  let component: CaCurrentSpaceDashboardPageComponent;
  let fixture: ComponentFixture<CaCurrentSpaceDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceDashboardPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
