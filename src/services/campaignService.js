// client/src/services/campaignService.js

/**
 * Fetch the procedurally generated default campaign.
 * @param {number} length Number of non-boss rooms
 */
export async function getDefaultCampaign(length = 8) {
  // ⚠️ Use a query param, **not** a path-param
  const res = await fetch(`/api/campaigns/default?length=${length}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}` // if your route is protected
    }
  });
  if (!res.ok) {
    throw new Error(`Campaign load failed (${res.status})`);
  }
  return res.json(); // { campaign: [...] }
}
