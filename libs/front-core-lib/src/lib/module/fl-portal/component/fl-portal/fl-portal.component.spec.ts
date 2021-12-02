import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalComponent } from './fl-portal.component';

describe('FlPortalComponent', () => {
  let component: FlPortalComponent;
  let fixture: ComponentFixture<FlPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
