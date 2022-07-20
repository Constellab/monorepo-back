import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkEngineConfigComponent} from './fl-bio-network-engine-config.component';

describe('FlBioNetworkEngineConfigComponent', () => {
  let component: FlBioNetworkEngineConfigComponent;
  let fixture: ComponentFixture<FlBioNetworkEngineConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkEngineConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkEngineConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
