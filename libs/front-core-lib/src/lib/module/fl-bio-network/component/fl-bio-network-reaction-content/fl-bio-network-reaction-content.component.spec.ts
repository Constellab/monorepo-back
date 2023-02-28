import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlBioNetworkReactionContentComponent } from './fl-bio-network-reaction-content.component';

describe('FlBioNetworkReactionContentComponent', () => {
  let component: FlBioNetworkReactionContentComponent;
  let fixture: ComponentFixture<FlBioNetworkReactionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlBioNetworkReactionContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlBioNetworkReactionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
