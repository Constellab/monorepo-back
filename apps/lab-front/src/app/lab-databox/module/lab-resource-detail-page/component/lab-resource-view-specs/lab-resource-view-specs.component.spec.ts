import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewSpecsComponent} from './lab-resource-view-specs.component';

describe('BioxResourceToolbarComponent', () => {
  let component: LabResourceViewSpecsComponent;
  let fixture: ComponentFixture<LabResourceViewSpecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewSpecsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewSpecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
