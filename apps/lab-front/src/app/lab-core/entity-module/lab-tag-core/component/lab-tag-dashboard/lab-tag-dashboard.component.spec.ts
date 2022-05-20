import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagDashboardComponent} from './lab-tag-dashboard.component';

describe('LabTagDashboardComponent', () => {
  let component: LabTagDashboardComponent;
  let fixture: ComponentFixture<LabTagDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTagDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
