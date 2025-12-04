import React, { useCallback, useEffect, useState } from 'react';
import ArtistCard from '../../components/Home/ArtistCard';
import PlaylistCard from '../../components/Home/PlaylistCard';
import { useCurrentAccount } from '../../contexts/CurrentAccountContext';
import { getFollowedArtists } from '../../api/artists';
import { getAccountPlaylists, createPlaylist } from '../../api/playlists';

const HomePage = () => {
  const { currentAccount, followVersion } = useCurrentAccount();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistCreateLoading, setPlaylistCreateLoading] = useState(false);
  const [playlistCreateError, setPlaylistCreateError] = useState('');
  const [playlistCreateMessage, setPlaylistCreateMessage] = useState('');

  useEffect(() => {
    const loadFollowed = async () => {
      if (!currentAccount?.id) {
        setArtists([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await getFollowedArtists(currentAccount.id);
        console.group('Followed artists data');
        data.forEach((artist) => {
          console.groupCollapsed(`${artist.artist_name} (${artist.artist_id})`);
          console.log('Albums payload:', artist.albums);
          console.groupEnd();
        });
        console.groupEnd();
        setArtists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFollowed();
  }, [currentAccount?.id, followVersion]);

  const loadPlaylists = useCallback(async () => {
    if (!currentAccount?.id) {
      setPlaylists([]);
      return;
    }

    setPlaylistsLoading(true);
    setPlaylistsError('');
    try {
      const data = await getAccountPlaylists(currentAccount.id);
      setPlaylists(data);
    } catch (err) {
      setPlaylistsError(err.message);
    } finally {
      setPlaylistsLoading(false);
    }
  }, [currentAccount?.id]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();
    if (!currentAccount?.id || !newPlaylistName.trim()) {
      return;
    }

    setPlaylistCreateLoading(true);
    setPlaylistCreateError('');
    setPlaylistCreateMessage('');

    try {
      await createPlaylist(currentAccount.id, {
        playlist_name: newPlaylistName.trim()
      });
      setPlaylistCreateMessage(`Playlist “${newPlaylistName.trim()}” created`);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      loadPlaylists();
    } catch (err) {
      setPlaylistCreateError(err.message);
    } finally {
      setPlaylistCreateLoading(false);
    }
  };

  return (
    <>
      <section className="page-section">
        <h1>Followed Artists</h1>
        {loading && <p>Loading artists…</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && artists.length === 0 && <p>No followed artists yet.</p>}
        <div className="artist-grid">
          {artists.map((artist) => (
            <ArtistCard key={artist.artist_id} artist={artist} />
          ))}
        </div>
      </section>
      <section className="page-section playlist-section">
        <h1>Playlists</h1>
        {playlistsLoading && <p>Loading playlists…</p>}
        {playlistsError && <p className="error-text">{playlistsError}</p>}
        {!playlistsLoading && !playlistsError && playlists.length === 0 && (
          <p>No playlists yet for this account.</p>
        )}
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
        <div className="playlist-section__actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setShowCreatePlaylist(true);
              setPlaylistCreateError('');
              setPlaylistCreateMessage('');
            }}
          >
            Add playlist
          </button>
        </div>
        {playlistCreateMessage && <p className="update-text">{playlistCreateMessage}</p>}
        {playlistCreateError && <p className="error-text">{playlistCreateError}</p>}
      </section>
      {showCreatePlaylist && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create playlist</h2>
            <form className="profile-edit-form" onSubmit={handleCreatePlaylist}>
              <div className="form-row">
                <label htmlFor="playlist_name">Playlist name</label>
                <input
                  id="playlist_name"
                  name="playlist_name"
                  value={newPlaylistName}
                  onChange={(event) => setNewPlaylistName(event.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={playlistCreateLoading}>
                  {playlistCreateLoading ? 'Creating…' : 'Create playlist'}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowCreatePlaylist(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
