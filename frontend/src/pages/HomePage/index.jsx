import React, { useEffect, useState } from 'react';
import ArtistCard from '../../components/Home/ArtistCard';
import { useCurrentAccount } from '../../contexts/CurrentAccountContext';
import { getFollowedArtists } from '../../api/artists';

const HomePage = () => {
  const { currentAccount } = useCurrentAccount();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  }, [currentAccount]);

  return (
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
  );
};

export default HomePage;
