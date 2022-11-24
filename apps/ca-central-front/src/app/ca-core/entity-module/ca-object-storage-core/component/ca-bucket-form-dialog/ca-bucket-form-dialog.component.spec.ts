import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketFormDialogComponent} from './ca-bucket-form-dialog.component';

describe('CaBucketFormDialogComponent', () => {
  let component: CaBucketFormDialogComponent;
  let fixture: ComponentFixture<CaBucketFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
