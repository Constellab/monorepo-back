import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardPageComponent} from './ca-dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: CaDashboardPageComponent;
  let fixture: ComponentFixture<CaDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
