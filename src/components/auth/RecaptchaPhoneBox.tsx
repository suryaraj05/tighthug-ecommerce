import { cn } from '@/lib/utils';

type Props = {
  containerId: string;
  className?: string;
};

/**
 * Wraps Firebase Phone Auth reCAPTCHA v2 (compact) with a smaller visual footprint.
 * Google’s iframe has a fixed min size; we scale the host down and clip overflow.
 */
export function RecaptchaPhoneBox({ containerId, className }: Props) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[300px] overflow-hidden rounded-lg border border-border/70 bg-muted/25',
        className
      )}
    >
      <div className="flex justify-center overflow-hidden px-1 pt-1 pb-0">
        <div
          className="inline-block origin-top scale-[0.82] [transform-origin:50%_0%] sm:scale-[0.88]"
          style={{ marginBottom: '-10px' }}
        >
          {/* Standard checkbox width ~302px; scaling keeps it readable but shorter */}
          <div id={containerId} className="h-[72px] w-[302px] max-w-[100vw] min-w-0 sm:h-[74px]" />
        </div>
      </div>
    </div>
  );
}
