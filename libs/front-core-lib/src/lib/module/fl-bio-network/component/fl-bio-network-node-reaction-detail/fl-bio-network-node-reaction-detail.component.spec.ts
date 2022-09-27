import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeReactionDetailComponent} from './fl-bio-network-node-reaction-detail.component';

describe('FlBioNetworkNodeReactionDetailComponent', () => {
  let component: FlBioNetworkNodeReactionDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeReactionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeReactionDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkNodeReactionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
