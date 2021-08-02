import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLoginDialogComponent} from './fl-login-dialog.component';

describe('FlLoginDialogComponent', () => {
  let component: FlLoginDialogComponent;
  let fixture: ComponentFixture<FlLoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoginDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
