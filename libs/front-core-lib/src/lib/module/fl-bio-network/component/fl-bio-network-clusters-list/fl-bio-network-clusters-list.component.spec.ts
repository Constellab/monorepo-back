import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkClustersListComponent} from './fl-bio-network-clusters-list.component';

describe('FlBioNetworkClustersListComponent', () => {
  let component: FlBioNetworkClustersListComponent;
  let fixture: ComponentFixture<FlBioNetworkClustersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkClustersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkClustersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
