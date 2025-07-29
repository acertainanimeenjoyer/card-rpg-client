// client/src/services/gameService.js

/**
 * Play a turn by sending:
 *   - selectedCards: Array
 *   - playerStats:    Object
 *   - enemy:          Object  (full enemy state)
 */
export async function playTurnAPI(payload) {
  const res = await fetch('/api/game/play', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const response = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(response.error || response.message || `Play turn failed (${res.status})`);
  }
  return response;
}
