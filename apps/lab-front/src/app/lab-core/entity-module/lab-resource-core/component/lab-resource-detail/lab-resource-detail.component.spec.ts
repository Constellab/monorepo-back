import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailComponent} from './lab-resource-detail.component';

describe('LabResourceDetail2Component', () => {
  let component: LabResourceDetailComponent;
  let fixture: ComponentFixture<LabResourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
