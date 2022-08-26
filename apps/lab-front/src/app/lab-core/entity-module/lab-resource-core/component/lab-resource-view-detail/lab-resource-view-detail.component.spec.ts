import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewDetailComponent} from './lab-resource-view-detail.component';

describe('LabViewConfigDetailComponent', () => {
  let component: LabResourceViewDetailComponent;
  let fixture: ComponentFixture<LabResourceViewDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceViewDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
