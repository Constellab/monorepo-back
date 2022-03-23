import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPortalHeaderButtonsComponent} from './fl-portal-header-buttons.component';

describe('FlPortalHeaderButtonsComponent', () => {
  let component: FlPortalHeaderButtonsComponent;
  let fixture: ComponentFixture<FlPortalHeaderButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalHeaderButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalHeaderButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
