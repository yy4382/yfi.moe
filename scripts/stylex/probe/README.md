# Astro / StyleX compatibility probe

The probe stays outside the pnpm workspace so it cannot become a production
route or dependency. It uses the application's pinned dependency installation.
From the repository root, after `pnpm install`:

```sh
ln -s ../../../app/blog-astro/node_modules scripts/stylex/probe/node_modules
cd scripts/stylex/probe
NODE_ENV=development ./node_modules/.bin/astro dev --port 3101
```

In another terminal, build and preview the production probe:

```sh
cd scripts/stylex/probe
./node_modules/.bin/astro build
./node_modules/.bin/astro preview --port 3102
```

The symlink and build/cache output are ignored. If the symlink already exists,
skip `ln -s`. The probe has an isolated Vite cache to avoid cross-invalidating
the application's dependency cache.

Run `node scripts/stylex/verify-probe.mjs` and
`node scripts/stylex/verify-hmr.mjs` from the repository root. Results and PNGs
are written to `artifacts.local/stylex/probe`. The HMR check temporarily changes
a padding declaration, checks the browser, and restores the original file.
