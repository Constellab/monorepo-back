import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketCredentialsInlineComponent} from './ca-bucket-credentials-inline.component';

describe('CaBucketCredentialsInlineComponent', () => {
  let component: CaBucketCredentialsInlineComponent;
  let fixture: ComponentFixture<CaBucketCredentialsInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketCredentialsInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketCredentialsInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
