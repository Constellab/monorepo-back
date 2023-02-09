import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickRightPanelComponent } from './ha-public-brick-right-panel.component';

describe('HaPublicBrickRightPanelComponent', () => {
  let component: HaPublicBrickRightPanelComponent;
  let fixture: ComponentFixture<HaPublicBrickRightPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickRightPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaPublicBrickRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
