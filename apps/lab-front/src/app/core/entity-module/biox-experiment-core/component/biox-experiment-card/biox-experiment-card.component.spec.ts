import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentCardComponent } from './biox-experiment-card.component';

describe('LabExperimentCardComponent', () => {
  let component: BioxExperimentCardComponent;
  let fixture: ComponentFixture<BioxExperimentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
