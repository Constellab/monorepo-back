import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentStatusOptionsComponent} from './biox-experiment-status-options.component';

describe('BioxExperimentStatusOptionsComponent', () => {
  let component: BioxExperimentStatusOptionsComponent;
  let fixture: ComponentFixture<BioxExperimentStatusOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentStatusOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentStatusOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
