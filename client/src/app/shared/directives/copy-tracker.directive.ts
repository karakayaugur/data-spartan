import { CdkCopyToClipboard } from "@angular/cdk/clipboard";
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from "@angular/core";

@Directive({
  selector: "[appCopyTracker]",
  standalone: true,
  hostDirectives: [
    {
      directive: CdkCopyToClipboard,
      // Re-export CDK inputs/outputs so templates can keep using [cdkCopyToClipboard].
      inputs: ["cdkCopyToClipboard", "cdkCopyToClipboardAttempts"],
      outputs: ["cdkCopyToClipboardCopied"],
    },
  ],
})
export class CopyTrackerDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @Input() duration = 1500;

  private clearCopiedTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener("cdkCopyToClipboardCopied", ["$event"])
  onCopyCopied(copied: boolean) {
    if (!copied) return;

    this.renderer.addClass(this.el.nativeElement, "copied");
    this.restartHideTimer();
  }

  ngOnDestroy() {
    if (this.clearCopiedTimer) {
      clearTimeout(this.clearCopiedTimer);
      this.clearCopiedTimer = null;
    }

    this.renderer.removeClass(this.el.nativeElement, "copied");
  }

  private restartHideTimer() {
    if (this.clearCopiedTimer) {
      clearTimeout(this.clearCopiedTimer);
    }

    this.clearCopiedTimer = setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, "copied");
      this.clearCopiedTimer = null;
    }, this.duration);
  }
}
