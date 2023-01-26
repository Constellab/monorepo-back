import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaHomeComponent } from './ha-home.component';

describe('HaHomeComponent', () => {
  let component: HaHomeComponent;
  let fixture: ComponentFixture<HaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
