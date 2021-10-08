import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeSearchComponent} from './fl-bio-network-node-search.component';

describe('FlBioNetworkNodeSearchComponent', () => {
  let component: FlBioNetworkNodeSearchComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkNodeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
