import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/Profile/ProfileCard';
import { getAccounts, getAccountById } from '../../api/accounts';
import { useCurrentAccount } from '../../contexts/CurrentAccountContext';

const subscriptionOptions = ['Standard', 'Premium', 'Family'];

const ProfilePage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState({
    user_name: '',
    email: '',
    subscription_type: ''
  });
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { setCurrentAccount } = useCurrentAccount();

  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      setError('');

      try {
        const data = await getAccounts();
        setAccounts(data);
        setSelectedAccountId((prev) => prev || data[0]?.id || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) {
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      setError('');
      setMessage('');

      try {
        const data = await getAccountById(selectedAccountId);
        setProfile(data);
        setFormValues({
          user_name: data.user_name ?? '',
          email: data.email ?? '',
          subscription_type: data.subscription_type ?? ''
        });
        setCurrentAccount(data);
        console.log('Fetched profile from DB:', data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [selectedAccountId, setCurrentAccount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAccountId) {
      return;
    }

    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/accounts/${selectedAccountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to update profile.');
      }

      const updated = await response.json();
      console.log('Updated profile response:', updated);
      setProfile(updated);
      setCurrentAccount(updated);
      setMessage('Profile saved to the database');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="page-section">
      <h1>Profile</h1>
      <div className="inner-page-section">
        <div className="profile-switcher">
            {loadingAccounts ? (
              <span>Loading users…</span>
            ) : (
              <select
                value={selectedAccountId}
                onChange={(event) => {
                  setSelectedAccountId(event.target.value);
                  setMessage('');
                }}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.user_name}
                  </option>
                ))}
              </select>
            )}
          </div>


          <ProfileCard profile={profile} />
          {loadingProfile && <p>Loading profile…</p>}

 

        {error && <p className="error-text">{error}</p>}

        <h2 className="padding-top-5rem">Edit Profile</h2>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="user_name">Name</label>
            <input
              id="user_name"
              name="user_name"
              value={formValues.user_name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
          <div className="form-row">
            <label htmlFor="subscription_type">Subscription</label>
            <select
              id="subscription_type"
              name="subscription_type"
              value={formValues.subscription_type}
              onChange={handleChange}
            >
              <option value="">Select type</option>
              {subscriptionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={updating}>
            {updating ? 'Saving…' : 'Save profile'}
          </button>
          {message && <p className="update-text">{message}</p>}
        </form>
      </div>
    </section>
  );
};

export default ProfilePage;
