import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalActionLineComponent } from './fl-portal-action-line.component';

describe('FlDialogLoaderLineComponent', () => {
  let component: FlPortalActionLineComponent;
  let fixture: ComponentFixture<FlPortalActionLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalActionLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalActionLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
