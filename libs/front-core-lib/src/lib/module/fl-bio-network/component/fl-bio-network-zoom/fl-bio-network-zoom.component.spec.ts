import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkZoomComponent} from './fl-bio-network-zoom.component';

describe('FlBioNetworkZoomComponent', () => {
  let component: FlBioNetworkZoomComponent;
  let fixture: ComponentFixture<FlBioNetworkZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkZoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
