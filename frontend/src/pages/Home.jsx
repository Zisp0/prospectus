import React from 'react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome{user ? `, ${user.email}` : ''}!</h1>
      <p className="text-lg">This is the protected home page.</p>
    </div>
  );
};

export default Home;
