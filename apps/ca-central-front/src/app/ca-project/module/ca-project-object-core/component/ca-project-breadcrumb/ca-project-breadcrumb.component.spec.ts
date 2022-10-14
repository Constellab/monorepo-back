import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectBreadcrumbComponent} from './ca-project-breadcrumb.component';

describe('CaProjectBreadcrumbComponent', () => {
  let component: CaProjectBreadcrumbComponent;
  let fixture: ComponentFixture<CaProjectBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectBreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
