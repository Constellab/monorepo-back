import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTagFormDialogComponent} from './fl-tag-form-dialog.component';

describe('FlTagFormDialogComponent', () => {
  let component: FlTagFormDialogComponent;
  let fixture: ComponentFixture<FlTagFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTagFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTagFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
