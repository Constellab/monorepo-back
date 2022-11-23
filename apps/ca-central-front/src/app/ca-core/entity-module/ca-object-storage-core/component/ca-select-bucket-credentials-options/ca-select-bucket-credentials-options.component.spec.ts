import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectBucketCredentialsOptionsComponent} from './ca-select-bucket-credentials-options.component';

describe('CaSelectBucketCredentialsOptionsComponent', () => {
  let component: CaSelectBucketCredentialsOptionsComponent;
  let fixture: ComponentFixture<CaSelectBucketCredentialsOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectBucketCredentialsOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectBucketCredentialsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
