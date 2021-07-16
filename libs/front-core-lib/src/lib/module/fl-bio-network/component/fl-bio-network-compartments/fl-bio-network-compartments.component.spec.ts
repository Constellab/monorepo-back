import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkCompartmentsComponent} from './fl-bio-network-compartments.component';

describe('FlBioNetworkCompartmentsComponent', () => {
  let component: FlBioNetworkCompartmentsComponent;
  let fixture: ComponentFixture<FlBioNetworkCompartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkCompartmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkCompartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
