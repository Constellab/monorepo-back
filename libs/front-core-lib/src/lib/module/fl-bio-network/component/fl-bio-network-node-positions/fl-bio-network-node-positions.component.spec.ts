import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodePositionsComponent} from './fl-bio-network-node-positions.component';

describe('FlBioNetworkNodeSaveComponent', () => {
  let component: FlBioNetworkNodePositionsComponent;
  let fixture: ComponentFixture<FlBioNetworkNodePositionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodePositionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkNodePositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
