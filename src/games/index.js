import SignalRunnerGame from './SignalRunnerGame';

export const GAME_REGISTRY = [
  {
    id: 'signal-runner',
    title: 'Signal Runner',
    subtitle: 'Tactical recon mini-game',
    component: SignalRunnerGame,
  },
];

export const getGame = (id) => GAME_REGISTRY.find((game) => game.id === id) || GAME_REGISTRY[0];
