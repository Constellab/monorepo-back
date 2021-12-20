import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceMultiViewComponent} from './lab-resource-multi-view.component';

describe('BioxResourceMultiViewComponent', () => {
  let component: LabResourceMultiViewComponent;
  let fixture: ComponentFixture<LabResourceMultiViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceMultiViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceMultiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
