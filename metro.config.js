// Metro configuration for EventSpace Mobile.
//
// We exclude `supabase/` from Metro's watch + bundle graph because that
// folder contains Deno-based Edge Functions written in TypeScript. Those
// `.ts` files are deployed to Supabase, not bundled into the React Native
// app, and including them would force the (unused) TypeScript toolchain
// onto the Expo project.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const BLOCKED = /\/supabase\/(functions|migrations)\/.*$/;

config.resolver.blockList = config.resolver.blockList
  ? [].concat(config.resolver.blockList, BLOCKED)
  : BLOCKED;

config.watchFolders = (config.watchFolders || []).filter(
  (p) => !p.startsWith(path.join(__dirname, 'supabase'))
);

module.exports = config;
