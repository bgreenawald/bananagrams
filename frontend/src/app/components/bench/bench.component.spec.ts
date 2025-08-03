import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchComponent } from './bench.component';

describe('BenchComponent', () => {
  let component: BenchComponent;
  let fixture: ComponentFixture<BenchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BenchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});