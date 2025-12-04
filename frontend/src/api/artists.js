const handleResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'API request failed');
  }

  return response.json();
};

export const getFollowedArtists = async (accountId) => {
  const response = await fetch(`/accounts/${accountId}/followed-artists`);
  return handleResponse(response);
};

export const getAlbumTracks = async (albumId) => {
  const response = await fetch(`/albums/${albumId}/tracks`);
  return handleResponse(response);
};

export const getDiscoverArtists = async (accountId) => {
  const response = await fetch(`/accounts/${accountId}/discover-artists`);
  return handleResponse(response);
};

export const followArtist = async (accountId, artistId) => {
  const response = await fetch(`/accounts/${accountId}/follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist_id: artistId })
  });
  return handleResponse(response);
};

export const unfollowArtist = async (accountId, artistId) => {
  const response = await fetch(`/accounts/${accountId}/follows/${artistId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Failed to unfollow artist');
  }
  return null;
};

