import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectActionsMenuComponent} from './ca-project-actions-menu.component';

describe('CaProjectActionsMenuComponent', () => {
  let component: CaProjectActionsMenuComponent;
  let fixture: ComponentFixture<CaProjectActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectActionsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
