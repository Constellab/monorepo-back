import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalHeaderComponent } from './fl-portal-header.component';

describe('FlPortalHeaderComponent', () => {
  let component: FlPortalHeaderComponent;
  let fixture: ComponentFixture<FlPortalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
