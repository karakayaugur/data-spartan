import { Injectable, inject } from "@angular/core";
import { FocusMonitor } from "@angular/cdk/a11y";
import { Dialog, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { ComponentType } from "@angular/cdk/portal";

@Injectable({ providedIn: "root" })
export class ModalService {
  private readonly dialog = inject(Dialog);
  private readonly focusMonitor = inject(FocusMonitor);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config: DialogConfig<D, DialogRef<R, C>> = {},
  ): DialogRef<R, C> {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const origin = trigger?.matches(":focus-visible") ? "keyboard" : "mouse";
    const restoreFocus = config.restoreFocus ?? true;
    const ref = this.dialog.open<R, D, C>(component, {
      hasBackdrop: true,
      autoFocus: "first-tabbable",
      panelClass: "app-modal-panel",
      backdropClass: "modal-backdrop",
      maxWidth: "calc(100vw - 32px)",
      ...config,
      restoreFocus: false,
    });
    ref.closed.subscribe(() => {
      const target =
        typeof restoreFocus === "string"
          ? document.querySelector<HTMLElement>(restoreFocus)
          : restoreFocus instanceof HTMLElement
            ? restoreFocus
            : restoreFocus
              ? trigger
              : null;
      if (target?.isConnected) this.focusMonitor.focusVia(target, origin);
    });
    return ref;
  }
}
