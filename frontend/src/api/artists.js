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

