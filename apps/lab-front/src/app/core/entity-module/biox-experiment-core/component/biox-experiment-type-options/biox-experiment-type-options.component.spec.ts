import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentTypeOptionsComponent} from './biox-experiment-type-options.component';

describe('BioxExperimentTypeOptionsComponent', () => {
  let component: BioxExperimentTypeOptionsComponent;
  let fixture: ComponentFixture<BioxExperimentTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
