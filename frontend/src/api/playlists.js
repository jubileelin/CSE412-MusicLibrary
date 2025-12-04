const handleResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'API request failed');
  }

  return response.json();
};

export const getAccountPlaylists = async (accountId) => {
  const response = await fetch(`/accounts/${accountId}/playlists`);
  return handleResponse(response);
};

export const createPlaylist = async (accountId, payload) => {
  const response = await fetch(`/accounts/${accountId}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
};

