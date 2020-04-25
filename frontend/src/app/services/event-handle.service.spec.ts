import { TestBed } from '@angular/core/testing';

import { EventHandleService } from './event-handle.service';

describe('EventHandleService', () => {
  let service: EventHandleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventHandleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
