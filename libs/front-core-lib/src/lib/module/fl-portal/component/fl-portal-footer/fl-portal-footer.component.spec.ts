import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalFooterComponent } from './fl-portal-footer.component';

describe('FlPortalFooterComponent', () => {
  let component: FlPortalFooterComponent;
  let fixture: ComponentFixture<FlPortalFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
