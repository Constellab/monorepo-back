import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPortalContentComponent } from './fl-portal-content.component';

describe('FlPortalContentComponent', () => {
  let component: FlPortalContentComponent;
  let fixture: ComponentFixture<FlPortalContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPortalContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
