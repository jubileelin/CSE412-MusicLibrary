import React, { useEffect, useState } from 'react';
import { getAlbumTracks } from '../../../api/artists.js';

// Album card component can be expanded later to fetch tracks by album ID.
const AlbumCard = ({ album, onClose }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!album) {
      setTracks([]);
      return;
    }

    setLoading(true);
    console.log(`Loading tracks for album ${album.id} (${album.name})`);

    getAlbumTracks(album.id)
      .then((data) =>
        data.map((track, index) => ({
          number: track.track_number ?? index + 1,
          title: track.title ?? 'Unknown',
          duration: formatDuration(track.duration),
          explicit: track.is_explicit
        }))
      )
      .then((mapped) => {
        console.log('Received tracks:', mapped);
        setTracks(mapped);
      })
      .catch((err) => {
        console.error('Failed to load tracks', err);
        setTracks([]);
      })
      .finally(() => setLoading(false));
  }, [album]);

  if (!album) {
    return null;
  }

  return (
    <div className="artist-card__album-popup">
      <button type="button" className="artist-card__album-close" onClick={onClose}>
        ×
      </button>
      <div className="artist-card__album-header">
        <div className="artist-card__album-image">
          {album.image ? (
            <img src={album.image} alt={album.name} />
          ) : (
            <div className="artist-card__album-placeholder" />
          )}
        </div>
        <div>
          <h5>{album.name}</h5>
          <div className="artist-card__album-info">
            <span className="artist-card__album-info__field">Release Date: {album.release_date || 'Unknown'}</span>
            <span className="artist-card__album-info__field">Genre: {album.genre || '—'}</span>
            <span className="artist-card__album-info__field">Tracks: {tracks.length}</span>
          </div>
        </div>
      </div>

      <div className="artist-card__track-list">
        <div className="artist-card__track-row artist-card__track-row--header">
          <span>#</span>
          <span>Title</span>
          <span>Duration</span>
          <span>Explicit</span>
        </div>
        {loading ? (
          <div className="artist-card__track-row">
            <span>Loading tracks…</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="artist-card__track-row">
            <span>No tracks found</span>
          </div>
        ) : (
          tracks.map((track) => (
            <div className="artist-card__track-row" key={`${track.number}-${track.title}`}>
              <span>{track.number}</span>
              <span>{track.title}</span>
              <span>{track.duration}</span>
              <span>{track.explicit ? 'Yes' : 'No'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const formatDuration = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'number') {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return value;
};

export default AlbumCard;
