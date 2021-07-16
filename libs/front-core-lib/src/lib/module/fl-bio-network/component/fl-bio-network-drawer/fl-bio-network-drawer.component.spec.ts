import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkDrawerComponent} from './fl-bio-network-drawer.component';

describe('FlPathwayDrawerActionComponent', () => {
  let component: FlBioNetworkDrawerComponent;
  let fixture: ComponentFixture<FlBioNetworkDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
