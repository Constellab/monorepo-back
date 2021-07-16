import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkSelectionInfoComponent} from './fl-bio-network-selection-info.component';

describe('FlBioNetworkSelectionInfoComponent', () => {
  let component: FlBioNetworkSelectionInfoComponent;
  let fixture: ComponentFixture<FlBioNetworkSelectionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkSelectionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkSelectionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
