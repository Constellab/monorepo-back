import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkConfigComponent} from './fl-bio-network-config.component';

describe('FlPathwayConfigComponent', () => {
  let component: FlBioNetworkConfigComponent;
  let fixture: ComponentFixture<FlBioNetworkConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
