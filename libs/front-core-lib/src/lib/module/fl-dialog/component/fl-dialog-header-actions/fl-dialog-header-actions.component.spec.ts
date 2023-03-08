import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlDialogHeaderActionsComponent } from './fl-dialog-header-actions.component';

describe('FlDialogHeaderActionsComponent', () => {
  let component: FlDialogHeaderActionsComponent;
  let fixture: ComponentFixture<FlDialogHeaderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDialogHeaderActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDialogHeaderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
