import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicTechDocComponent } from './ha-public-tech-doc.component';

describe('HaPublicTechDocComponent', () => {
  let component: HaPublicTechDocComponent;
  let fixture: ComponentFixture<HaPublicTechDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicTechDocComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicTechDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
