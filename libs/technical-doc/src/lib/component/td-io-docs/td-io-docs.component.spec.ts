import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdIoDocsComponent} from './td-io-docs.component';

describe('TdIoDocViewComponent', () => {
  let component: TdIoDocsComponent;
  let fixture: ComponentFixture<TdIoDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdIoDocsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdIoDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
