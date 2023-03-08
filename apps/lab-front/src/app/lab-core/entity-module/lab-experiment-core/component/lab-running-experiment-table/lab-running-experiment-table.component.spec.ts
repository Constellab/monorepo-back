import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabRunningExperimentTableComponent } from './lab-running-experiment-table.component';

describe('LabRunningExperimentTableComponent', () => {
  let component: LabRunningExperimentTableComponent;
  let fixture: ComponentFixture<LabRunningExperimentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabRunningExperimentTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabRunningExperimentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
