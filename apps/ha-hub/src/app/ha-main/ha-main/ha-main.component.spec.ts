import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaMainComponent } from './ha-main.component';

describe('HaMainComponent', () => {
  let component: HaMainComponent;
  let fixture: ComponentFixture<HaMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaMainComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
