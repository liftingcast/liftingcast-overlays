# LiftingCast Overlay Starter App build with React + TypeScript + Vite

This is an example project to build graphic overlays for LiftingCast. You can add this to your video feed as a web capture using tools like OBS (https://obsproject.com/).

https://vitejs.dev/ for more info on developing with vite.

## Getting started

Install node version from .nvmrc file.
Recommend using nvm. (https://github.com/nvm-sh/nvm).

```
nvm install
nvm use
```

Copy .env.sample to .env

```
cp .env.sample .env
```

Fill in your api key, meet id, and meet password.

Run development server with hot reloading.

```
npm run dev
```

Edit graphics as needed.

## Hosting

You can run this app on the same system that you run your steaming capture software. Using the following command when running a meet as it will have better performance.

```
npm run start
```

If you host this app online it is recommended that access to load the app is secured in some way. Your LiftingCast API key and meet password will be available in the source code and could be stolen from you. It is your responsibility to keep your LiftingCast API key secure.

### Clock

Warning on using the clock. Inconsistent network latency may make it inaccurate. There is an latency adjustment in the Clock.tsx file.
