import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectObjectBreadcrumbComponent} from './ca-project-object-breadcrumb.component';

describe('CaProjectBreadcrumbComponent', () => {
  let component: CaProjectObjectBreadcrumbComponent;
  let fixture: ComponentFixture<CaProjectObjectBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectObjectBreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectObjectBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
