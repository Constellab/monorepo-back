import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlArticleContainerComponent} from './fl-article-container.component';

describe('FlArticleContainerComponent', () => {
  let component: FlArticleContainerComponent;
  let fixture: ComponentFixture<FlArticleContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlArticleContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlArticleContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
