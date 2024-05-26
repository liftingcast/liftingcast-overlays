import "./App.css";
import { Dashboard } from "./components/Dashboard/Dashboard";

const meetId = import.meta.env.VITE_LIFTINGCAST_MEET_ID as string | undefined;
const password = import.meta.env.VITE_LIFTINGCAST_MEET_PASSWORD as
  | string
  | undefined;
const apiKey = import.meta.env.VITE_LIFTINGCAST_API_KEY as string | undefined;
const apiBaseUrl = import.meta.env.VITE_LIFTINGCAST_WEBSOCKET_URL as
  | string
  | undefined;

export const App = () => {
  if (!meetId || !password || !apiKey || !apiBaseUrl) {
    return (
      <div>
        {!meetId && <div>VITE_LIFTINGCAST_MEET_ID not configured</div>}
        {!password && <div>VITE_LIFTINGCAST_MEET_PASSWORD not configured</div>}
        {!apiKey && <div>VITE_LIFTINGCAST_API_KEY not configured</div>}
        {!apiBaseUrl && (
          <div>VITE_LIFTINGCAST_WEBSOCKET_URL not configured</div>
        )}
      </div>
    );
  }
  return (
    <Dashboard
      apiBaseUrl={apiBaseUrl}
      apiKey={apiKey}
      meetId={meetId}
      password={password}
    />
  );
};
