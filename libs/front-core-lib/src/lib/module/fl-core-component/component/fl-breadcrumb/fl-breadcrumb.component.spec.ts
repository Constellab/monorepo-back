import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBreadcrumbComponent} from './fl-breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: FlBreadcrumbComponent;
  let fixture: ComponentFixture<FlBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBreadcrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
