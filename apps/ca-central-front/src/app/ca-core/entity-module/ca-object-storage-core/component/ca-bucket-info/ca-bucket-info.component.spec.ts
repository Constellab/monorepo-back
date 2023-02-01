import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketInfoComponent} from './ca-bucket-info.component';

describe('CaBucketInfoComponent', () => {
  let component: CaBucketInfoComponent;
  let fixture: ComponentFixture<CaBucketInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
