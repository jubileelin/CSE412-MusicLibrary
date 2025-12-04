import React, { useEffect, useState } from 'react';
import ArtistCard from '../../components/Home/ArtistCard';
import { useCurrentAccount } from '../../contexts/CurrentAccountContext';
import { getDiscoverArtists } from '../../api/artists';

const DiscoverPage = () => {
  const { currentAccount, followVersion } = useCurrentAccount();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArtists = async () => {
      if (!currentAccount?.id) {
        setArtists([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await getDiscoverArtists(currentAccount.id);
        setArtists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadArtists();
  }, [currentAccount?.id, followVersion]);

  return (
    <section className="page-section">
      <h1>Discover</h1>
      {loading && <p>Loading new artists…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && artists.length === 0 && <p>No new artists yet.</p>}
      <div className="artist-grid">
        {artists.map((artist) => (
          <ArtistCard key={artist.artist_id} artist={artist} />
        ))}
      </div>
    </section>
  );
};

export default DiscoverPage;
