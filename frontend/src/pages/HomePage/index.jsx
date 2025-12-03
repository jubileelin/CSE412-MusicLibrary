import React from 'react';
import { NavLink } from 'react-router-dom';
import FollowedArtistCarousel from '../../components/Home/FollowedArtistCarousel';
import PlaylistCarousel from '../../components/Home/PlaylistCarousel';

const HomePage = () => (
  <section className="page-section">
    <h2>Home</h2>
      <section className="inner-page-section">
        <FollowedArtistCarousel />
        <PlaylistCarousel />
      </section>

  </section>
);

export default HomePage;
