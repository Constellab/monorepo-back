import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlBioNetworkReactionDetailComponent} from './fl-bio-network-reaction-detail.component';

describe('FlBioNetworkReactionDetailComponent', () => {
  let component: FlBioNetworkReactionDetailComponent;
  let fixture: ComponentFixture<FlBioNetworkReactionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkReactionDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlBioNetworkReactionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
