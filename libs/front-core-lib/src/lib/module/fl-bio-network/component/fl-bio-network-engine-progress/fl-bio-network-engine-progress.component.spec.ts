import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkEngineProgressComponent} from './fl-bio-network-engine-progress.component';

describe('FlBioNetworkEngineProgressComponent', () => {
  let component: FlBioNetworkEngineProgressComponent;
  let fixture: ComponentFixture<FlBioNetworkEngineProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkEngineProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkEngineProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
