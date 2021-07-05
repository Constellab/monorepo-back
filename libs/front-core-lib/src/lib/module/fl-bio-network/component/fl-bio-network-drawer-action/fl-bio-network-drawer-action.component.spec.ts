import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkDrawerActionComponent} from './fl-bio-network-drawer-action.component';

describe('FlPathwayDrawerActionComponent', () => {
  let component: FlBioNetworkDrawerActionComponent;
  let fixture: ComponentFixture<FlBioNetworkDrawerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkDrawerActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkDrawerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
