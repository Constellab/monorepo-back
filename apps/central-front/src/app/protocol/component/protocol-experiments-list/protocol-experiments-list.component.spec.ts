import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolExperimentsListComponent} from './protocol-experiments-list.component';

describe('ProtocolExperimentListComponent', () => {
  let component: ProtocolExperimentsListComponent;
  let fixture: ComponentFixture<ProtocolExperimentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolExperimentsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolExperimentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
