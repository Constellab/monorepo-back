import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDialogHeaderComponent} from './fl-dialog-header.component';

describe('DialogTitleComponent', () => {
  let component: FlDialogHeaderComponent;
  let fixture: ComponentFixture<FlDialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDialogHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDialogHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
