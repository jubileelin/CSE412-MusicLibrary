const handleResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Unable to load account data.');
  }

  return response.json();
};

export const getAccounts = async () => {
  const response = await fetch('/accounts');
  return handleResponse(response);
};

export const getAccountById = async (id) => {
  const response = await fetch(`/accounts/${id}`);
  return handleResponse(response);
};

