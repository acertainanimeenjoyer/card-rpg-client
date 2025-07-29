// client/src/services/campaignService.js

/**
 * Fetch the procedurally generated default campaign.
 * @param {number} length Number of non-boss rooms
 */
export async function getDefaultCampaign(length = 8) {
  const res = await fetch(`/api/campaigns/default?length=${length}`);
  if (!res.ok) {
    throw new Error('Failed to load campaign');
  }
  return res.json(); // { campaign: [ ...rooms ] }
}
