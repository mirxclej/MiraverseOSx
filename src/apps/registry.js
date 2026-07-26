import { Folder, Terminal, Globe, Settings, Info, Gamepad2 } from 'lucide-react';
import { miraverseDb } from '../db/miraverseDb';

// Icon mapping per app ID
const ICON_MAP = {
  files: Folder,
  terminal: Terminal,
  browser: Globe,
  settings: Settings,
  about: Info,
  gameplay: Gamepad2,
};

// Populate launchable APPS list dynamically from miraverseDb
const BASE_APPS = miraverseDb.getApps().map((app) => ({
  ...app,
  icon: ICON_MAP[app.id] || Folder,
  contentKey: app.id,
}));

const GAMEPLAY_APP = {
  id: 'gameplay',
  title: 'Gameplay',
  icon: ICON_MAP.gameplay,
  contentKey: 'gameplay',
  kind: 'gameplay',
  size: { width: 980, height: 640 },
  minSize: { width: 700, height: 480 },
};

export const APPS = [...BASE_APPS, GAMEPLAY_APP];

export const getApp = (id) => APPS.find((a) => a.id === id);
