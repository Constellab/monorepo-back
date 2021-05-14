import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalActionsComponent } from './fl-portal-actions.component';

describe('FlDialogLoadersComponent', () => {
  let component: FlPortalActionsComponent;
  let fixture: ComponentFixture<FlPortalActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
