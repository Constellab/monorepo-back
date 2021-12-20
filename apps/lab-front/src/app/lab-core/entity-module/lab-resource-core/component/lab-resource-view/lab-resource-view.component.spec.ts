import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewComponent} from './lab-resource-view.component';

describe('BioxResourceViewComponent', () => {
  let component: LabResourceViewComponent;
  let fixture: ComponentFixture<LabResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
