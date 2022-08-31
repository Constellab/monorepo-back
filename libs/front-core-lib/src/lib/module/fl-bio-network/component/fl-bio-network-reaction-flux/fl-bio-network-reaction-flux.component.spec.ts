import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkReactionFluxComponent} from './fl-bio-network-reaction-flux.component';

describe('FlBioNetworkReactionFluxComponent', () => {
  let component: FlBioNetworkReactionFluxComponent;
  let fixture: ComponentFixture<FlBioNetworkReactionFluxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkReactionFluxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkReactionFluxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
