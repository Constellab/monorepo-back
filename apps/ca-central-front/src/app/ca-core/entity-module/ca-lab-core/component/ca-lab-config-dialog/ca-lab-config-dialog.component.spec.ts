import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabConfigDialogComponent} from './ca-lab-config-dialog.component';

describe('CaLabConfigDialogComponent', () => {
  let component: CaLabConfigDialogComponent;
  let fixture: ComponentFixture<CaLabConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabConfigDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
