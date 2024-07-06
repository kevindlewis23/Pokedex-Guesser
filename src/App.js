import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokedexEntries, setPokedexEntries] = useState([]);
  const [translatedEntry, setTranslatedEntry] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('es');
  const [attempts, setAttempts] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [originalEntry, setOriginalEntry] = useState('');
  const [pokemonSprite, setPokemonSprite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRandomPokemon();
  }, []);

  useEffect(() => {
    if (originalEntry) {
      getTranslatedEntry(originalEntry, language);
    }
  }, [language, originalEntry]);

  const getRandomPokemon = async () => {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
    const data = response.data;
    const name = data.name;
    const entries = data.flavor_text_entries;
    const englishEntry = entries.find(entry => entry.language.name === 'en').flavor_text.replace(/\s+/g, ' ');
    const spriteResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const sprite = spriteResponse.data.sprites.front_default;

    setPokemonName(name);
    setPokedexEntries(entries);
    setOriginalEntry(englishEntry);
    setPokemonSprite(sprite);
    resetGame();
  };

  const getTranslatedEntry = async (text, target_language) => {
    try {
      setLoading(true);
      const response = await axios.post('https://translation-service-csohi2q64q-uc.a.run.app/translate', {
        text: text,
        target_language: target_language
      });
      setTranslatedEntry(response.data.translation);
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslatedEntry('Translation not available.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = () => {
    if (userGuess.toLowerCase() === pokemonName.toLowerCase()) {
      setMessage(`Correct! The Pokémon is ${pokemonName}.`);
      setGameOver(true);
    } else {
      setAttempts(attempts - 1);
      if (attempts > 1) {
        setMessage('Incorrect. Try again.');
      } else {
        setMessage(`No more guesses! The Pokémon was ${pokemonName}.`);
        setGameOver(true);
      }
    }
  };

  const handleGiveUp = () => {
    setMessage(`You gave up! The Pokémon was ${pokemonName}.`);
    setGameOver(true);
  };

  const handleRestart = () => {
    getRandomPokemon();
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleInputChange = (e) => {
    setUserGuess(e.target.value);
  };

  const resetGame = () => {
    setUserGuess('');
    setMessage('');
    setAttempts(3);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">Pokédex Guesser</h1>
      <label className="mb-4">
        <span className="mr-2">Select Language:</span>
        <select value={language} onChange={handleLanguageChange} className="border p-2 rounded">
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="fr">French</option>
          <option value="ja">Japanese</option>
          <option value="ru">Russian</option>
          <option value="he">Hebrew</option>
          <option value="du">Dutch</option>
          <option value="zz">Mangled English</option>
        </select>
      </label>
      <div className="bg-white p-4 rounded shadow-md mb-4" style={{ minHeight: '100px' }}>
        <p>{translatedEntry}</p>
      </div>
      <input
        type="text"
        value={userGuess}
        onChange={handleInputChange}
        disabled={gameOver}
        placeholder="Your guess"
        className="border p-2 rounded mb-4"
      />
      <div className="flex space-x-4 mb-4">
        <button onClick={handleGuess} disabled={gameOver || userGuess === ''} className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${gameOver || userGuess === '' ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Guess
        </button>
        <button onClick={handleGiveUp} disabled={gameOver} className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 ${gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Give Up
        </button>
        <button onClick={handleRestart} disabled={!gameOver} className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 ${!gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Restart
        </button>
      </div>
      <p className="text-lg mt-4">{message}</p>
      <p className="text-lg mt-2">Attempts Left: {attempts}</p>
      <div className="flex flex-col items-center mt-4" style={{ minHeight: '160px' }}>
        {loading ? (
          <div className="loader"></div>
        ) : (
          gameOver && (
            <>
              <img src={pokemonSprite} alt={pokemonName} className="w-24 h-24 mb-2" />
              <p className="text-gray-600">{originalEntry}</p>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default App;
