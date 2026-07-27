interface AppStatusBannersProps {
  status: string;
}

export function AppStatusBanners({ status }: AppStatusBannersProps) {
  if (status === 'no-config') {
    return (
      <div className="banner banner-warn banner-revolut" role="alert">
        API URL not configured. Set VITE_HABITS_API_URL in GitHub secrets or pwa/.env.development.
      </div>
    );
  }

  if (status === 'online-unauthorized') {
    return (
      <div className="banner banner-warn banner-revolut" role="alert">
        Server reachable — paste your bearer token in Settings.
      </div>
    );
  }

  return null;
}
