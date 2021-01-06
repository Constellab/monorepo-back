import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ServerInfoFormDialogComponent} from './server-info-form-dialog.component';

describe('ServerInfoFormDialogComponent', () => {
  let component: ServerInfoFormDialogComponent;
  let fixture: ComponentFixture<ServerInfoFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerInfoFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerInfoFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
