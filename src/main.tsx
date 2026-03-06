import React from 'react';
import ReactDOM from 'react-dom/client';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import App from './App.tsx';
import './styles/index.css';

const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID ?? '';

const RENDER_DELAY_MS = 2500;

async function bootstrap() {
  const root = document.getElementById('root');
  if (!root) return;

  let discordSdk: DiscordSDK | null = null;

  const render = (errorNode?: React.ReactNode) => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        {errorNode}
        <App discordSdk={discordSdk} />
      </React.StrictMode>
    );
  };

  if (!clientId) {
    render(
      <div className="app-error">
        <p>Missing VITE_DISCORD_CLIENT_ID. Set it in .env and restart.</p>
        <p>You can still play below (standalone mode).</p>
      </div>
    );
    return;
  }

  try {
    discordSdk = new DiscordSDK(clientId);
    await Promise.race([
      discordSdk.ready(),
      new Promise<void>((resolve) => setTimeout(resolve, RENDER_DELAY_MS)),
    ]);
  } catch (e) {
    discordSdk = null;
    console.warn('Discord SDK not available (run inside Discord for full integration):', e);
  }

  render();
}

bootstrap();
