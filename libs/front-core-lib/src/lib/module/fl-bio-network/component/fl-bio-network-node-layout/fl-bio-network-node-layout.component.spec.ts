import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkNodeLayoutComponent} from './fl-bio-network-node-layout.component';

describe('FlBioNetworkNodeSaveComponent', () => {
  let component: FlBioNetworkNodeLayoutComponent;
  let fixture: ComponentFixture<FlBioNetworkNodeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkNodeLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkNodeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
