import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkLegendComponent} from './fl-bio-network-legend.component';

describe('FlBioNetworkLegendComponent', () => {
  let component: FlBioNetworkLegendComponent;
  let fixture: ComponentFixture<FlBioNetworkLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
