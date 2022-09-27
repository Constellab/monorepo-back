import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeMetaboliteDetailComponent} from './fl-bio-network-node-metabolite-detail.component';

describe('FlBioNetworkMetaboliteNodeDetailComponent', () => {
  let component: FlBioNetworkNodeMetaboliteDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeMetaboliteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeMetaboliteDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkNodeMetaboliteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
