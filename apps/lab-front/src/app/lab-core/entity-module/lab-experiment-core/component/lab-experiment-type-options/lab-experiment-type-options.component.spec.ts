import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentTypeOptionsComponent} from './lab-experiment-type-options.component';

describe('BioxExperimentTypeOptionsComponent', () => {
  let component: LabExperimentTypeOptionsComponent;
  let fixture: ComponentFixture<LabExperimentTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
