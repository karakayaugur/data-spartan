import {
  LucideCalendar,
  LucideClock,
  LucideTrash2,
  LucideX,
  provideLucideIcons,
} from "@lucide/angular";
import { TestBed } from "@angular/core/testing";
import { Dialog } from "@angular/cdk/dialog";
import { ModalService } from "./modal-service";
import { ViewingLog } from "./viewing-log/viewing-log";

describe("ModalService", () => {
  afterEach(() => TestBed.inject(Dialog).closeAll());

  it("opens viewing log inside the shared shell and closes from the shared button", () => {
    TestBed.configureTestingModule({
      providers: [provideLucideIcons(LucideCalendar, LucideClock, LucideTrash2, LucideX)],
    });
    const service = TestBed.inject(ModalService);
    const ref = service.open(ViewingLog, {
      data: { id: 1, title: "A New Hope" },
      ariaLabel: "A New Hope",
    });
    ref.componentRef!.changeDetectorRef.detectChanges();
    expect(document.querySelector("app-modal h2")?.textContent).toContain("A New Hope");
    expect(document.querySelector(".modal-backdrop")).not.toBeNull();
    const closed = jasmine.createSpy("closed");
    ref.closed.subscribe(closed);
    (
      document.querySelector('app-modal button[aria-label="Close modal"]') as HTMLButtonElement
    ).click();
    expect(closed).toHaveBeenCalled();
  });
});
