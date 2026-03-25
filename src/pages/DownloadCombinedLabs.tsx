import { useEffect, useState } from 'react';

const FILENAME = 'Combined_All_Labs.ipynb';

const DownloadCombinedLabs = () => {
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const fileUrl = `${base}downloads/${encodeURIComponent(FILENAME)}`;

    let cancelled = false;
    let objectUrl: string | null = null;
    let revokeTimer: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = FILENAME;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStatus('ok');
        revokeTimer = setTimeout(() => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
        }, 3000);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage((e as Error).message || 'Download failed');
      }
    };

    run();
    return () => {
      cancelled = true;
      if (revokeTimer) clearTimeout(revokeTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const directHref = `${base}downloads/${encodeURIComponent(FILENAME)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Combined All Labs</h1>
        {status === 'pending' && (
          <p className="text-muted-foreground text-sm">Starting download…</p>
        )}
        {status === 'ok' && (
          <p className="text-muted-foreground text-sm">
            Download should begin shortly. If nothing happened, use the link below.
          </p>
        )}
        {status === 'error' && (
          <p className="text-destructive text-sm">Could not start download: {errorMessage}</p>
        )}
        <p className="text-sm">
          <a
            href={directHref}
            download={FILENAME}
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Download {FILENAME}
          </a>
        </p>
      </div>
    </div>
  );
};

export default DownloadCombinedLabs;
