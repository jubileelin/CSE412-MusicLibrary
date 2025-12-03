import React, { useState } from 'react';

const HeartIcon = ({ active }) => (
  <svg
    className={`artist-card__follow-icon ${active ? 'active' : ''}`}
    viewBox="0 0 21.5 19.3"
    aria-hidden="true"
  >
    <path d="M11.37,18.46c-.34.12-.9.12-1.24,0C7.23,17.47.75,13.34.75,6.34.75,3.25,3.24.75,6.31.75c1.82,0,3.43.88,4.44,2.24,1.01-1.36,2.63-2.24,4.44-2.24,3.07,0,5.56,2.5,5.56,5.59,0,7-6.48,11.13-9.38,12.12Z" />
  </svg>
);

const ArtistCard = () => {
  const [following, setFollowing] = useState(false);

  return (
    <div className="artist-card">
      <div className="artist-card__header">
        <button
          type="button"
          className={`artist-card__follow-button ${following ? 'active' : ''}`}
          onClick={() => setFollowing((prev) => !prev)}
          aria-pressed={following}
        >
          <HeartIcon active={following} />
          {following ? 'Following' : 'Follow'}
        </button>
        <h3>Taylor Swift</h3>
      </div>
      <div className="artist-card__bio">
        <p>Artist Description</p>
      </div>
      <div className="artist-card__info">
        <span className="artist-card__info__field">Since 2006</span>
        <span className="artist-card__divider" aria-hidden="true" />
        <span className="artist-card__info__field">Genre: Pop</span>
        <span className="artist-card__divider" aria-hidden="true" />
        <span className="artist-card__info__field">English</span>
      </div>
      <div className="artist-card__albums_section">
        <h4>Albums</h4>
        <div className="artist-card__albums_list">
          <div>Album 1</div>
          <div>Album 2</div>
          <div>Album 3</div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
