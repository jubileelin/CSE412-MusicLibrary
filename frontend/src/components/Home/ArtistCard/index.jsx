import React, { useEffect, useState } from 'react';
import AlbumCard from '../AlbumCard';
import { useCurrentAccount } from '../../../contexts/CurrentAccountContext';
import { followArtist, unfollowArtist } from '../../../api/artists';

const HeartIcon = ({ active }) => (
  <svg
    className={`artist-card__follow-icon ${active ? 'active' : ''}`}
    viewBox="0 0 21.5 19.3"
    aria-hidden="true"
  >
    <path d="M11.37,18.46c-.34.12-.9.12-1.24,0C7.23,17.47.75,13.34.75,6.34.75,3.25,3.24.75,6.31.75c1.82,0,3.43.88,4.44,2.24,1.01-1.36,2.63-2.24,4.44-2.24,3.07,0,5.56,2.5,5.56,5.59,0,7-6.48,11.13-9.38,12.12Z" />
  </svg>
);

const ArtistCard = ({ artist }) => {
  const { currentAccount, incrementFollowVersion } = useCurrentAccount();
  const accountId = currentAccount?.id;
  const initialFollowing = artist.is_following ?? true;
  const [following, setFollowing] = useState(initialFollowing);
  const [processingFollow, setProcessingFollow] = useState(false);
  const albums = artist.albums?.filter((album) => album?.name) || [];
  const [activeAlbum, setActiveAlbum] = useState(null);

  const toggleAlbum = (album) => {
    if (!album?.id) {
      return;
    }
    setActiveAlbum((current) => (current?.id === album.id ? null : album));
  };

  const infoSince = artist.start_date ? `Since ${new Date(artist.start_date).getFullYear()}` : 'Since —';
  const truncateBio = (text, length = 120) => {
    if (!text) {
      return 'Artist bio is not available yet.';
    }
    return text.length > length ? `${text.slice(0, length).trim()}…` : text;
  };

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleFollowToggle = async () => {
    if (!accountId || processingFollow) {
      return;
    }

    setProcessingFollow(true);
    try {
      if (following) {
        await unfollowArtist(accountId, artist.artist_id);
      } else {
        await followArtist(accountId, artist.artist_id);
      }
      setFollowing((prev) => !prev);
      incrementFollowVersion();
    } catch (err) {
      console.error('Follow toggle failed', err);
    } finally {
      setProcessingFollow(false);
    }
  };

  const coverStyle = artist.artist_image
    ? { backgroundImage: `url(${artist.artist_image})` }
    : undefined;

  return (
    <div className="artist-card-wrapper">
      <div className="artist-card">
        <div className="artist-card__header">
          <h3>{artist.artist_name}</h3>
          <button
            type="button"
            className={`artist-card__follow-button ${following ? 'active' : ''}`}
            onClick={handleFollowToggle}
            aria-pressed={following}
            disabled={!accountId || processingFollow}
          >
            <HeartIcon active={following} />
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
        <div className="artist-card__cover" style={coverStyle}>
          {!artist.artist_image && <span>{artist.artist_name?.charAt(0) ?? 'U'}</span>}
        </div>
        <div className="artist-card__bio">
        <p>{truncateBio(artist.bio)}</p>
      </div>
      <div className="artist-card__info">
        <span className="artist-card__info__field">{infoSince}</span>
        <span className="artist-card__divider" aria-hidden="true" />
        <span className="artist-card__info__field">Genre: {artist.genre || '—'}</span>
        <span className="artist-card__divider" aria-hidden="true" />
        <span className="artist-card__info__field">{artist.artist_language || 'Unknown'}</span>
      </div>
      <div className="artist-card__albums_section">
        <h4>Albums</h4>
        <div className="artist-card__albums_list">
          {albums.length === 0 && <p className="artist-card__album-empty">No albums available</p>}
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              className={`artist-card__album-name ${
                activeAlbum?.id === album.id ? 'active' : ''
              }`}
              onClick={() => toggleAlbum(album)}
            >
              {album.name}
            </button>
          ))}
        </div>
      </div>
      </div>
      {activeAlbum && <AlbumCard album={activeAlbum} onClose={() => setActiveAlbum(null)} />}
    </div>
  );
};

export default ArtistCard;
