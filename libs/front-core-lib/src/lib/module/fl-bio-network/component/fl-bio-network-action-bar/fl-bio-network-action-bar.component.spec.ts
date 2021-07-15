import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkActionBarComponent} from './fl-bio-network-action-bar.component';

describe('FlBioNetworkActionBarComponent', () => {
  let component: FlBioNetworkActionBarComponent;
  let fixture: ComponentFixture<FlBioNetworkActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkActionBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
