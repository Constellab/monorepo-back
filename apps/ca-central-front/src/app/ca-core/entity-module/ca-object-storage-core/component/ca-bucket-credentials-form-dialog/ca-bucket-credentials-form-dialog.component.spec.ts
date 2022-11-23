import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketCredentialsFormDialogComponent} from './ca-bucket-credentials-form-dialog.component';

describe('CaBucketCredentialsFormDialogComponent', () => {
  let component: CaBucketCredentialsFormDialogComponent;
  let fixture: ComponentFixture<CaBucketCredentialsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketCredentialsFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketCredentialsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
