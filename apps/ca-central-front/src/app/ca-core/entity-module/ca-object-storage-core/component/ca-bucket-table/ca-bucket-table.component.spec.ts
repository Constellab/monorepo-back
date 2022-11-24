import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketTableComponent} from './ca-bucket-table.component';

describe('CaBucketTableComponent', () => {
  let component: CaBucketTableComponent;
  let fixture: ComponentFixture<CaBucketTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
