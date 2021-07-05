import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkComponent} from './fl-bio-network.component';

describe('FlChartPathwayComponent', () => {
  let component: FlBioNetworkComponent;
  let fixture: ComponentFixture<FlBioNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
