import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardBreadcrumbComponent} from './ca-dashboard-breadcrumb.component';

describe('CaDashboardBreadcrumbComponent', () => {
  let component: CaDashboardBreadcrumbComponent;
  let fixture: ComponentFixture<CaDashboardBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardBreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDashboardBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
