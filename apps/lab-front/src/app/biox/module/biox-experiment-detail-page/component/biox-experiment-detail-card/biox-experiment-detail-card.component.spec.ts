import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentDetailCardComponent} from './biox-experiment-detail-card.component';

describe('BioxExperimentDetailCardComponent', () => {
  let component: BioxExperimentDetailCardComponent;
  let fixture: ComponentFixture<BioxExperimentDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentDetailCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
