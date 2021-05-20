import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlExternalLinkComponent } from './fl-external-link.component';

describe('FlExternalLinkComponent', () => {
  let component: FlExternalLinkComponent;
  let fixture: ComponentFixture<FlExternalLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlExternalLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlExternalLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
