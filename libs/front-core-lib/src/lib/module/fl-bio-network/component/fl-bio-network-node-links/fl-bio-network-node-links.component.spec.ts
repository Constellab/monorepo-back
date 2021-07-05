import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeLinksComponent} from './fl-bio-network-node-links.component';

describe('FlChartPathwayNodeLinksComponent', () => {
  let component: FlBioNetworkNodeLinksComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeLinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkNodeLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
