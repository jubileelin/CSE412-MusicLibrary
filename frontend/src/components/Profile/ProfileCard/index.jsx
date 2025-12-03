import React from 'react';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const ProfileCard = ({ profile }) => {
  if (!profile) {
    return <div className="profile-card">Loading profile...</div>;
  }

  const {
    user_name,
    email,
    subscription_type,
    date_joined,
    playlist_count,
    followed_artist_count
  } = profile;

  return (
    <div className="profile-card">
      <h2>{user_name}</h2>
      <p>Email: {email}</p>
      <p>Subscription: {subscription_type || 'Standard'}</p>
      <p>Member since: {formatDate(date_joined)}</p>
      <div className="profile-card__stats">
        <span>Playlists: {playlist_count ?? 0}</span>
        <span>Followed artists: {followed_artist_count ?? 0}</span>
      </div>
    </div>
  );
};

export default ProfileCard;
