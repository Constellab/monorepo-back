import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigActionsMenuComponent} from './lab-view-config-actions-menu.component';

describe('LabViewConfigActionsMenuComponent', () => {
  let component: LabViewConfigActionsMenuComponent;
  let fixture: ComponentFixture<LabViewConfigActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigActionsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewConfigActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
