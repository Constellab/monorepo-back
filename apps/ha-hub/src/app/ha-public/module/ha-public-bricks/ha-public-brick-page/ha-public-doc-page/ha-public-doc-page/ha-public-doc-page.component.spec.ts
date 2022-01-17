import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicDocPageComponent } from './ha-public-doc-page.component';

describe('DaPublicDocPageComponent', () => {
  let component: HaPublicDocPageComponent;
  let fixture: ComponentFixture<HaPublicDocPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicDocPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicDocPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
