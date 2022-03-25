import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickVersionsTableComponent } from './ha-public-brick-versions-table.component';

describe('HaPublicBrickVersionsTableComponent', () => {
  let component: HaPublicBrickVersionsTableComponent;
  let fixture: ComponentFixture<HaPublicBrickVersionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickVersionsTableComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicBrickVersionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
