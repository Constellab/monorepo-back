import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailComponent} from './lab-resource-detail.component';

describe('LabResourceDetailComponent', () => {
  let component: LabResourceDetailComponent;
  let fixture: ComponentFixture<LabResourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
