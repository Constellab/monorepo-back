import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HaAddVersionFormComponent} from './ha-add-version-form.component';

describe('HaAddVersionFormComponent', () => {
  let component: HaAddVersionFormComponent;
  let fixture: ComponentFixture<HaAddVersionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaAddVersionFormComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAddVersionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
