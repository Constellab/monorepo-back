import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSnackBarInfoComponent } from './fl-snack-bar-info.component';

describe('SnackBarInfoComponent', () => {
  let component: FlSnackBarInfoComponent;
  let fixture: ComponentFixture<FlSnackBarInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSnackBarInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSnackBarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
