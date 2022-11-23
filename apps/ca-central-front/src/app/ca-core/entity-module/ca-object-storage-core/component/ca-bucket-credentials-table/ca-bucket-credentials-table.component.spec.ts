import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketCredentialsTableComponent} from './ca-bucket-credentials-table.component';

describe('CaBucketCredentialsTableComponent', () => {
  let component: CaBucketCredentialsTableComponent;
  let fixture: ComponentFixture<CaBucketCredentialsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketCredentialsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketCredentialsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
