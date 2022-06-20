import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkTwoComponent} from './fl-bio-network-two.component';

describe('FlBioNetworkTwoComponent', () => {
  let component: FlBioNetworkTwoComponent;
  let fixture: ComponentFixture<FlBioNetworkTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkTwoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
