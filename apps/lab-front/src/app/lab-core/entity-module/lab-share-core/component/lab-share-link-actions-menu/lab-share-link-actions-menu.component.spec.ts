import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabShareLinkActionsMenuComponent} from './lab-share-link-actions-menu.component';

describe('LabShareLinkActionsMenuComponent', () => {
  let component: LabShareLinkActionsMenuComponent;
  let fixture: ComponentFixture<LabShareLinkActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabShareLinkActionsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabShareLinkActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
