import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeCofactorDetailComponent} from './fl-bio-network-node-cofactor-detail.component';

describe('FlBioNetworkNodeCofactorDetailComponent', () => {
  let component: FlBioNetworkNodeCofactorDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeCofactorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeCofactorDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkNodeCofactorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
