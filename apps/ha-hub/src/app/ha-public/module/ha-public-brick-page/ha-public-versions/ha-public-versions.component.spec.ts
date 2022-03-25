import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicVersionsComponent } from './ha-public-versions.component';

describe('HaPublicVersionsPageComponent', () => {
  let component: HaPublicVersionsComponent;
  let fixture: ComponentFixture<HaPublicVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicVersionsComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
