import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicVersionsPageComponent } from './ha-public-versions-page.component';

describe('HaPublicVersionsPageComponent', () => {
  let component: HaPublicVersionsPageComponent;
  let fixture: ComponentFixture<HaPublicVersionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicVersionsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicVersionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
