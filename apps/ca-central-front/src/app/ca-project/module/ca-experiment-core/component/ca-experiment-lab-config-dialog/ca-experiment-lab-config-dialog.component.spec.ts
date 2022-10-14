import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentLabConfigDialogComponent} from './ca-experiment-lab-config-dialog.component';

describe('CaExperiementLabConfigComponent', () => {
  let component: CaExperimentLabConfigDialogComponent;
  let fixture: ComponentFixture<CaExperimentLabConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentLabConfigDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentLabConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
