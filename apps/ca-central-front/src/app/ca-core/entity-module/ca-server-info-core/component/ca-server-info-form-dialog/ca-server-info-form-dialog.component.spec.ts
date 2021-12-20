import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaServerInfoFormDialogComponent} from './ca-server-info-form-dialog.component';

describe('ServerInfoFormDialogComponent', () => {
  let component: CaServerInfoFormDialogComponent;
  let fixture: ComponentFixture<CaServerInfoFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaServerInfoFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaServerInfoFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
