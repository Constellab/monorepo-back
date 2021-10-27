import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPrettyJsonDialogComponent} from './fl-pretty-json-dialog.component';

describe('FlPrettyJsonDialogComponent', () => {
  let component: FlPrettyJsonDialogComponent;
  let fixture: ComponentFixture<FlPrettyJsonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPrettyJsonDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPrettyJsonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
