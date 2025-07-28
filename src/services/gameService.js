import API from './api';

export const playTurn = async (selectedCards, playerStats, enemyId) => {
  const res = await API.post('/game/turn', {
    selectedCards,
    playerStats,
    enemyId
  });
  return res.data;
};
