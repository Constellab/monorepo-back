import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExperimentProtocolEditComponent} from './experiment-protocol-edit.component';

describe('ProtocolFormComponent', () => {
  let component: ExperimentProtocolEditComponent;
  let fixture: ComponentFixture<ExperimentProtocolEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentProtocolEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentProtocolEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
