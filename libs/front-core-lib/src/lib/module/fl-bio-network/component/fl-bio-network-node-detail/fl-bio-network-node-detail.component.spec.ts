import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeDetailComponent} from './fl-bio-network-node-detail.component';

describe('FlChartPathwayNodeDetailComponent', () => {
  let component: FlBioNetworkNodeDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkNodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
