import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDialogTitleComponent} from './fl-dialog-title.component';

describe('DialogTitleComponent', () => {
  let component: FlDialogTitleComponent;
  let fixture: ComponentFixture<FlDialogTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDialogTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDialogTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
