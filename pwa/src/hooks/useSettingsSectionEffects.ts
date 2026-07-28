import { useEffect } from 'react';

export function useSettingsSectionEffects(args: {
  oauthSuccess?: boolean;
  onDismissOauth?: () => void;
  disconnectSuccess: boolean;
  dismissDisconnectSuccess: () => void;
}) {
  const { oauthSuccess, onDismissOauth, disconnectSuccess, dismissDisconnectSuccess } = args;

  useEffect(() => {
    if (!oauthSuccess || !onDismissOauth) return;
    const id = window.setTimeout(onDismissOauth, 5000);
    return () => window.clearTimeout(id);
  }, [oauthSuccess, onDismissOauth]);

  useEffect(() => {
    if (!disconnectSuccess) return;
    const id = window.setTimeout(dismissDisconnectSuccess, 5000);
    return () => window.clearTimeout(id);
  }, [disconnectSuccess, dismissDisconnectSuccess]);
}
