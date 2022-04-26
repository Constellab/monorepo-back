import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkMetaboliteDetailComponent} from './fl-bio-network-metabolite-detail.component';

describe('FlBioNetworkMetaboliteDetailComponent', () => {
  let component: FlBioNetworkMetaboliteDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkMetaboliteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkMetaboliteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkMetaboliteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
