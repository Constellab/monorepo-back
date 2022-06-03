import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceWithViewComponent} from './lab-resource-with-view.component';

describe('LabResourceDetailTwoComponent', () => {
  let component: LabResourceWithViewComponent;
  let fixture: ComponentFixture<LabResourceWithViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceWithViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceWithViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
