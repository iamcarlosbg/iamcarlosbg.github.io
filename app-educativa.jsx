import React, { useState, useEffect, useRef } from 'react';
import { Star, Rocket, Book, Pencil, Trophy, Home } from 'lucide-react';

const AppEducativa = () => {
  const [currentGame, setCurrentGame] = useState('menu');
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-4">
      {currentGame === 'menu' && <MainMenu setCurrentGame={setCurrentGame} />}
      {currentGame === 'math' && <MathInvaders setCurrentGame={setCurrentGame} score={score} setScore={setScore} />}
      {currentGame === 'wordsearch' && <WordSearch setCurrentGame={setCurrentGame} score={score} setScore={setScore} />}
      {currentGame === 'typing' && <TypingPractice setCurrentGame={setCurrentGame} score={score} setScore={setScore} />}
    </div>
  );
};

const MainMenu = ({ setCurrentGame }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-white text-center mb-4 mt-8">
        🎮 Aprende Jugando
      </h1>
      <p className="text-xl text-white text-center mb-12">¡Elige tu juego favorito!</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <GameCard
          icon={<Rocket className="w-16 h-16" />}
          title="Invasores Matemáticos"
          description="¡Defiende la Tierra resolviendo operaciones!"
          color="from-red-400 to-orange-500"
          onClick={() => setCurrentGame('math')}
        />
        
        <GameCard
          icon={<Book className="w-16 h-16" />}
          title="Sopa de Letras"
          description="Encuentra palabras escondidas"
          color="from-green-400 to-teal-500"
          onClick={() => setCurrentGame('wordsearch')}
        />
        
        <GameCard
          icon={<Pencil className="w-16 h-16" />}
          title="Práctica de Escritura"
          description="Escribe correctamente y gana puntos"
          color="from-purple-400 to-pink-500"
          onClick={() => setCurrentGame('typing')}
        />
      </div>
    </div>
  );
};

const GameCard = ({ icon, title, description, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-2xl p-8 shadow-2xl transform transition hover:scale-105 hover:shadow-3xl text-white`}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </button>
  );
};

const MathInvaders = ({ setCurrentGame, score, setScore }) => {
  const [level, setLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [enemies, setEnemies] = useState([]);
  const [playerX, setPlayerX] = useState(50);
  const [question, setQuestion] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const gameAreaRef = useRef(null);

  const levels = {
    facil: { range: 10, speed: 15000, operations: ['suma'], fallSpeed: 0.56 },
    medio: { range: 20, speed: 11000, operations: ['suma', 'resta'], fallSpeed: 0.77 },
    dificil: { range: 50, speed: 7000, operations: ['suma', 'resta', 'multiplicar'], fallSpeed: 1.21 }
  };

  const generateQuestion = (levelConfig) => {
    const operations = levelConfig.operations;
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer, questionText;

    if (op === 'suma') {
      num1 = Math.floor(Math.random() * levelConfig.range) + 1;
      num2 = Math.floor(Math.random() * levelConfig.range) + 1;
      answer = num1 + num2;
      questionText = `${num1} + ${num2}`;
    } else if (op === 'resta') {
      num1 = Math.floor(Math.random() * levelConfig.range) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      questionText = `${num1} - ${num2}`;
    } else {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      questionText = `${num1} × ${num2}`;
    }

    return { questionText, answer };
  };

  const startGame = (selectedLevel) => {
    setLevel(selectedLevel);
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    const newQuestion = generateQuestion(levels[selectedLevel]);
    setQuestion(newQuestion);
    spawnEnemies(newQuestion.answer, levels[selectedLevel]);
  };

  const spawnEnemies = (correctAnswer, levelConfig) => {
    const answers = [correctAnswer];
    while (answers.length < 4) {
      const wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
      if (wrong !== correctAnswer && wrong > 0 && !answers.includes(wrong)) {
        answers.push(wrong);
      }
    }
    
    const shuffled = answers.sort(() => Math.random() - 0.5);
    const newEnemies = shuffled.map((ans, i) => ({
      id: Date.now() + i,
      value: ans,
      x: 20 + (i * 20),
      y: 0,
      isCorrect: ans === correctAnswer
    }));
    
    setEnemies(newEnemies);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setEnemies(prev => {
        const updated = prev.map(enemy => ({
          ...enemy,
          y: enemy.y + levels[level].fallSpeed
        }));

        const reachedBottom = updated.filter(e => e.y >= 85);
        if (reachedBottom.length > 0) {
          const correctReached = reachedBottom.find(e => e.isCorrect);
          if (correctReached) {
            setLives(l => l - 1);
            if (lives <= 1) {
              setGameOver(true);
              return [];
            }
          }
          
          const newQuestion = generateQuestion(levels[level]);
          setQuestion(newQuestion);
          spawnEnemies(newQuestion.answer, levels[level]);
          return [];
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameStarted, level, gameOver, lives]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return;
      
      if (e.key === 'ArrowLeft') {
        setPlayerX(x => Math.max(5, x - 5));
      } else if (e.key === 'ArrowRight') {
        setPlayerX(x => Math.min(85, x + 5));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const shootEnemy = (enemy) => {
    if (enemy.isCorrect) {
      setScore(s => s + 10);
      const newQuestion = generateQuestion(levels[level]);
      setQuestion(newQuestion);
      spawnEnemies(newQuestion.answer, levels[level]);
      setEnemies([]);
    } else {
      setLives(l => l - 1);
      if (lives <= 1) {
        setGameOver(true);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto text-white">
        <button
          onClick={() => setCurrentGame('menu')}
          className="mb-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Volver al Menú
        </button>
        
        <h2 className="text-4xl font-bold mb-8 text-center">Invasores Matemáticos 🚀</h2>
        <p className="text-xl text-center mb-8">Elige tu nivel de dificultad:</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => startGame('facil')}
            className="bg-green-500 hover:bg-green-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">😊 Fácil</h3>
            <p className="text-sm">Sumas hasta 10</p>
            <p className="text-sm">Velocidad lenta</p>
          </button>
          
          <button
            onClick={() => startGame('medio')}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🤔 Medio</h3>
            <p className="text-sm">Sumas y restas hasta 20</p>
            <p className="text-sm">Velocidad media</p>
          </button>
          
          <button
            onClick={() => startGame('dificil')}
            className="bg-red-500 hover:bg-red-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🔥 Difícil</h3>
            <p className="text-sm">Todas las operaciones</p>
            <p className="text-sm">Velocidad rápida</p>
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-4xl mx-auto text-white text-center">
        <h2 className="text-5xl font-bold mb-4">¡Juego Terminado! 🎮</h2>
        <p className="text-3xl mb-4">Puntuación Final: {score}</p>
        <Trophy className="w-24 h-24 mx-auto mb-8 text-yellow-300" />
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => startGame(level)}
            className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-xl font-bold"
          >
            Jugar de Nuevo
          </button>
          <button
            onClick={() => {
              setGameStarted(false);
              setLevel(null);
            }}
            className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-xl font-bold"
          >
            Cambiar Nivel
          </button>
          <button
            onClick={() => setCurrentGame('menu')}
            className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-xl text-xl font-bold"
          >
            Menú Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentGame('menu')}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Menú
        </button>
        <div className="text-2xl font-bold">Puntos: {score}</div>
        <div className="text-2xl font-bold">Vidas: {'❤️'.repeat(lives)}</div>
      </div>

      <div className="bg-black bg-opacity-50 rounded-xl p-4 mb-4">
        <h3 className="text-3xl font-bold text-center">¿Cuánto es {question?.questionText}?</h3>
      </div>

      <div ref={gameAreaRef} className="relative bg-blue-900 rounded-xl h-96 overflow-hidden">
        {enemies.map(enemy => (
          <button
            key={enemy.id}
            onClick={() => shootEnemy(enemy)}
            className="absolute bg-red-500 hover:bg-red-600 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center transform transition hover:scale-110 cursor-pointer"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {enemy.value}
          </button>
        ))}

        <div
          className="absolute bottom-4 bg-green-500 rounded-t-full w-12 h-16 flex items-end justify-center transition-all duration-100"
          style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
        >
          <div className="text-2xl">🚀</div>
        </div>
      </div>

      <p className="text-center mt-4 text-lg">
        Usa las flechas ← → para moverte. Haz clic en la respuesta correcta!
      </p>
    </div>
  );
};

const WordSearch = ({ setCurrentGame, score, setScore }) => {
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  const wordLists = {
    facil: ['GATO', 'PERRO', 'CASA', 'SOL', 'MAR'],
    medio: ['AVION', 'LIBRO', 'ARBOL', 'FLOR', 'MESA', 'SILLA'],
    dificil: ['MARIPOSA', 'ELEFANTE', 'DINOSAURIO', 'MONTAÑA', 'COMPUTADORA']
  };

  const generateGrid = (wordList, size) => {
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    const placedWords = [];

    wordList.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (direction === 'horizontal' && col + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            const positions = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i] = word[i];
              positions.push(`${row}-${col + i}`);
            }
            placedWords.push({ word, positions });
            placed = true;
          }
        } else if (direction === 'vertical' && row + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            const positions = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col] = word[i];
              positions.push(`${row + i}-${col}`);
            }
            placedWords.push({ word, positions });
            placed = true;
          }
        }
        attempts++;
      }
    });

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return { grid: newGrid, words: placedWords };
  };

  const startGame = (level) => {
    setDifficulty(level);
    const size = level === 'facil' ? 8 : level === 'medio' ? 10 : 12;
    const { grid: newGrid, words: placedWords } = generateGrid(wordLists[level], size);
    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords([]);
    setSelectedCells([]);
    setGameStarted(true);
    setScore(0);
  };

  const handleCellClick = (row, col) => {
    const cellId = `${row}-${col}`;
    const newSelected = [...selectedCells];

    if (newSelected.includes(cellId)) {
      setSelectedCells(newSelected.filter(c => c !== cellId));
    } else {
      newSelected.push(cellId);
      setSelectedCells(newSelected);

      words.forEach(wordObj => {
        const allSelected = wordObj.positions.every(pos => newSelected.includes(pos));
        if (allSelected && !foundWords.includes(wordObj.word)) {
          setFoundWords([...foundWords, wordObj.word]);
          setScore(s => s + 20);
        }
      });
    }
  };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto text-white">
        <button
          onClick={() => setCurrentGame('menu')}
          className="mb-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Volver al Menú
        </button>
        
        <h2 className="text-4xl font-bold mb-8 text-center">Sopa de Letras 🔤</h2>
        <p className="text-xl text-center mb-8">Elige tu nivel:</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => startGame('facil')}
            className="bg-green-500 hover:bg-green-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">😊 Fácil</h3>
            <p className="text-sm">Palabras cortas</p>
            <p className="text-sm">Cuadrícula 8×8</p>
          </button>
          
          <button
            onClick={() => startGame('medio')}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🤔 Medio</h3>
            <p className="text-sm">Palabras medianas</p>
            <p className="text-sm">Cuadrícula 10×10</p>
          </button>
          
          <button
            onClick={() => startGame('dificil')}
            className="bg-red-500 hover:bg-red-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🔥 Difícil</h3>
            <p className="text-sm">Palabras largas</p>
            <p className="text-sm">Cuadrícula 12×12</p>
          </button>
        </div>
      </div>
    );
  }

  const allWordsFound = foundWords.length === words.length;

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentGame('menu')}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Menú
        </button>
        <div className="text-2xl font-bold">Puntos: {score}</div>
      </div>

      {allWordsFound && (
        <div className="bg-green-500 text-white text-center p-4 rounded-xl mb-4">
          <h3 className="text-3xl font-bold mb-2">¡Felicidades! 🎉</h3>
          <p className="text-xl">¡Encontraste todas las palabras!</p>
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={() => startGame(difficulty)}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-bold"
            >
              Jugar de Nuevo
            </button>
            <button
              onClick={() => setGameStarted(false)}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-bold"
            >
              Cambiar Nivel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl p-4 inline-block">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
              {grid.map((row, i) =>
                row.map((cell, j) => {
                  const cellId = `${i}-${j}`;
                  const isSelected = selectedCells.includes(cellId);
                  const isPartOfFoundWord = words.some(
                    w => foundWords.includes(w.word) && w.positions.includes(cellId)
                  );

                  return (
                    <button
                      key={cellId}
                      onClick={() => handleCellClick(i, j)}
                      className={`w-10 h-10 font-bold text-lg rounded transition ${
                        isPartOfFoundWord
                          ? 'bg-green-400 text-white'
                          : isSelected
                          ? 'bg-blue-400 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4">Palabras a encontrar:</h3>
          <ul className="space-y-2">
            {words.map(wordObj => (
              <li
                key={wordObj.word}
                className={`text-xl font-bold ${
                  foundWords.includes(wordObj.word)
                    ? 'line-through text-green-300'
                    : 'text-white'
                }`}
              >
                {foundWords.includes(wordObj.word) ? '✓' : '○'} {wordObj.word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const TypingPractice = ({ setCurrentGame, score, setScore }) => {
  const [level, setLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const texts = {
    facil: [
      'El gato juega con la pelota',
      'Me gusta el helado de chocolate',
      'El sol brilla en el cielo',
      'Los perros son muy divertidos'
    ],
    medio: [
      'En el jardín hay muchas flores de colores',
      'Los dinosaurios vivieron hace millones de años',
      'Me encanta leer libros de aventuras',
      'El arcoíris aparece después de la lluvia'
    ],
    dificil: [
      'La computadora es una herramienta muy útil para aprender',
      'Los astronautas viajan al espacio en cohetes espaciales',
      'La fotosíntesis es el proceso por el cual las plantas producen su alimento',
      'El océano Pacífico es el más grande de todos los océanos del mundo'
    ]
  };

  const startGame = (selectedLevel) => {
    setLevel(selectedLevel);
    setGameStarted(true);
    setCompleted(false);
    setMistakes(0);
    setUserInput('');
    const randomText = texts[selectedLevel][Math.floor(Math.random() * texts[selectedLevel].length)];
    setCurrentText(randomText);
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);

    if (input === currentText) {
      setCompleted(true);
      const points = level === 'facil' ? 10 : level === 'medio' ? 20 : 30;
      setScore(s => s + points - mistakes);
    } else if (input.length > 0 && input[input.length - 1] !== currentText[input.length - 1]) {
      setMistakes(m => m + 1);
    }
  };

  const nextText = () => {
    const randomText = texts[level][Math.floor(Math.random() * texts[level].length)];
    setCurrentText(randomText);
    setUserInput('');
    setCompleted(false);
    setMistakes(0);
  };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto text-white">
        <button
          onClick={() => setCurrentGame('menu')}
          className="mb-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Volver al Menú
        </button>
        
        <h2 className="text-4xl font-bold mb-8 text-center">Práctica de Escritura ✍️</h2>
        <p className="text-xl text-center mb-8">Elige tu nivel:</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => startGame('facil')}
            className="bg-green-500 hover:bg-green-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">😊 Fácil</h3>
            <p className="text-sm">Frases cortas</p>
            <p className="text-sm">Palabras simples</p>
          </button>
          
          <button
            onClick={() => startGame('medio')}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🤔 Medio</h3>
            <p className="text-sm">Frases medianas</p>
            <p className="text-sm">Vocabulario intermedio</p>
          </button>
          
          <button
            onClick={() => startGame('dificil')}
            className="bg-red-500 hover:bg-red-600 rounded-xl p-8 transform transition hover:scale-105"
          >
            <h3 className="text-3xl font-bold mb-2">🔥 Difícil</h3>
            <p className="text-sm">Frases largas</p>
            <p className="text-sm">Palabras complejas</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentGame('menu')}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Menú
        </button>
        <div className="text-2xl font-bold">Puntos: {score}</div>
        <div className="text-xl">Errores: {mistakes}</div>
      </div>

      {completed && (
        <div className="bg-green-500 text-white text-center p-6 rounded-xl mb-6">
          <h3 className="text-3xl font-bold mb-2">¡Excelente! 🎉</h3>
          <p className="text-xl mb-4">¡Escribiste todo correctamente!</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={nextText}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold text-lg"
            >
              Siguiente Texto
            </button>
            <button
              onClick={() => setGameStarted(false)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold text-lg"
            >
              Cambiar Nivel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-8 mb-6">
        <h3 className="text-gray-700 text-xl mb-4 font-bold">Escribe este texto:</h3>
        <div className="text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
          {currentText.split('').map((char, index) => {
            let color = 'text-gray-400';
            if (index < userInput.length) {
              color = userInput[index] === char ? 'text-green-600' : 'text-red-600';
            }
            return (
              <span key={index} className={color}>
                {char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Empieza a escribir aquí..."
          className="w-full text-2xl p-4 border-4 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 text-gray-800"
          autoFocus
          disabled={completed}
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg">
          Progreso: {userInput.length} / {currentText.length} letras
        </p>
        <div className="w-full bg-white bg-opacity-30 rounded-full h-4 mt-2">
          <div
            className="bg-green-400 h-4 rounded-full transition-all duration-300"
            style={{ width: `${(userInput.length / currentText.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AppEducativa;