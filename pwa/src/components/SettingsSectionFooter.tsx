import { getBuildLabel } from '../lib/config';

export function SettingsSectionFooter({ error }: { error: string }) {
  return (
    <>
      {error && (
        <div className="banner banner-warn banner-revolut" role="alert">
          {error}
        </div>
      )}
      <p className="muted build-label">Build {getBuildLabel()}</p>
    </>
  );
}
