import React from 'react';

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

const PlaylistCard = ({ playlist }) => {
  const tracks = playlist.tracks || [];

  return (
    <div className="playlist-card">
      <div className="playlist-card__header">
        <h3>{playlist.playlist_name}</h3>
        <p className="playlist-card__meta">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          {playlist.is_explicit ? ' · Explicit' : ''}
        </p>
      </div>
      <div className="playlist-card__tracks">
        {tracks.length === 0 && <p className="playlist-card__empty">No tracks yet.</p>}
        {tracks.map((track) => (
          <div className="playlist-card__track-row" key={`${playlist.id}-${track.track_number}-${track.song_title}`}>
            <span className="playlist-card__track-number">{track.track_number ?? '-'}</span>
            <span className="playlist-card__track-title">{track.song_title}</span>
            <span className="playlist-card__track-duration">{formatDuration(track.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistCard;
