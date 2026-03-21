import { cn } from '@/lib/utils';

type Props = {
  containerId: string;
  className?: string;
};

/**
 * Host for Firebase Phone Auth reCAPTCHA v2 (compact). Keep layout minimal: fixed heights,
 * overflow clipping, and CSS transforms break iframe rendering in several browsers.
 */
export function RecaptchaPhoneBox({ containerId, className }: Props) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[320px] rounded-lg border border-border/70 bg-muted/25 px-2 py-3 sm:px-3',
        className
      )}
    >
      <div className="flex justify-center overflow-x-auto">
        {/* Let Google set iframe size — do not fix height or clip overflow */}
        <div id={containerId} className="inline-block" />
      </div>
    </div>
  );
}
