import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  Sparkles, 
  Dices, 
  Eye, 
  EyeOff, 
  Search,
  Check,
  AlertCircle,
  GripVertical
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────── */

type GameStage = 'setup' | 'reveal' | 'who-starts' | 'playing';

interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  isSuspect?: boolean;
}

interface PlayerData {
  id: string;
  name: string;
}

const DEFAULT_CATEGORIES: Record<string, string[]> = {
  "Frutas": ["Manzana", "Banana", "Mango", "Fresa", "Uva", "Melón", "Sandía", "Kiwi", "Pera", "Durazno", "Naranja", "Limón", "Piña", "Cereza", "Higo"],
  "Animales": ["León", "Tigre", "Elefante", "Jirafa", "Cebra", "Gorila", "Pingüino", "Cocodrilo", "Delfín", "Águila", "Lobo", "Zorro", "Oso", "Hipopótamo", "Flamenco"],
  "Países": ["Argentina", "Brasil", "Francia", "Japón", "Alemania", "Australia", "Egipto", "México", "Canadá", "India", "Italia", "Rusia", "China", "España", "Sudáfrica"],
  "Deportes": ["Fútbol", "Tenis", "Natación", "Boxeo", "Ciclismo", "Volleyball", "Rugby", "Golf", "Atletismo", "Esquí", "Surf", "Ajedrez", "Béisbol", "Baloncesto", "Karate"],
  "Profesiones": ["Médico", "Bombero", "Piloto", "Maestro", "Chef", "Astronauta", "Abogado", "Arquitecto", "Fotógrafo", "Músico", "Enfermero", "Detective", "Ingeniero", "Actor", "Científico"],
  "Películas": ["Titanic", "Avatar", "Matrix", "Joker", "Interstellar", "Coco", "Up", "Frozen", "Shrek", "Gladiador", "El Padrino", "Toy Story", "Avengers", "El Rey León", "Parasite"],
  "Comidas": ["Pizza", "Sushi", "Hamburguesa", "Tacos", "Pasta", "Asado", "Empanada", "Ramen", "Paella", "Curry", "Hot Dog", "Crepe", "Tortilla", "Ceviche", "Fondue"],
  "Instrumentos": ["Guitarra", "Piano", "Violín", "Batería", "Trompeta", "Flauta", "Saxofón", "Bajo", "Arpa", "Acordeón", "Clarinete", "Ukulele", "Cello", "Oboe", "Teclado"],
  "Superhéroes": ["Superman", "Batman", "Spiderman", "Wonder Woman", "Iron Man", "Thor", "Hulk", "Flash", "Aquaman", "Pantera Negra", "Capitán América", "Wolverine", "Deadpool", "Scarlet Witch", "Doctor Strange"],
  "Videojuegos": ["Minecraft", "Fortnite", "Mario", "Zelda", "Pokémon", "FIFA", "GTA", "Among Us", "Roblox", "Tetris", "Pac-Man", "Sonic", "Halo", "Overwatch", "The Sims"],
};

const RANDOM_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
  'Drew', 'Blake', 'Dana', 'Jamie', 'Avery', 'Reese', 'Skyler', 'Parker',
  'Mateo', 'Sofía', 'Valentina', 'Sebastián', 'Camila', 'Lucas', 'Emma', 'Rodrigo',
];

const STORAGE_KEY = 'impostor_custom_categories';

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

const getInitialCustomCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

interface PlayerListItemProps {
  key?: React.Key;
  p: PlayerData;
  index: number;
  onNameChange: (newName: string) => void;
  onRemove: () => void;
}

const PlayerListItem = ({ p, index, onNameChange, onRemove }: PlayerListItemProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={p}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 bg-[var(--surface2)] border border-[var(--border)] p-2 rounded-lg w-full max-w-full overflow-hidden"
    >
      <div 
        className="cursor-grab active:cursor-grabbing p-1 touch-none shrink-0"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical size={14} className="text-[var(--muted)] opacity-50 pointer-events-none" />
      </div>
      <span className="text-[var(--accent)] font-head text-sm w-4 shrink-0">{index + 1}</span>
      <input 
        className="bg-transparent border-none outline-none text-sm text-[var(--text)] flex-1 cursor-text min-w-0"
        value={p.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={`Jugador ${index + 1}`}
      />
      <button 
        className="text-[var(--muted)] hover:text-white cursor-pointer p-1 shrink-0"
        onClick={onRemove}
      >
        <X size={14} />
      </button>
    </Reorder.Item>
  );
};

/* ─────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────── */

interface ToastProps {
  key?: React.Key;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast = (props: ToastProps) => {
  const { message, type, onClose } = props;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`px-5 py-3 rounded-lg border text-sm font-medium shadow-lg pointer-events-auto ${
        type === 'success' ? 'border-[var(--success)] text-[var(--success)]' :
        type === 'error' ? 'border-[var(--accent)] text-[var(--accent)]' :
        'border-[var(--border)] text-[var(--text)]'
      } bg-[var(--surface)]`}
    >
      {message}
    </motion.div>
  );
};

export default function App() {
  // --- Game State ---
  const [stage, setStage] = useState<GameStage>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerNames, setPlayerNames] = useState<{id: string, name: string}[]>([
    { id: '1', name: 'Jugador 1' }, 
    { id: '2', name: 'Jugador 2' }, 
    { id: '3', name: 'Jugador 3' }, 
    { id: '4', name: 'Jugador 4' }
  ]);
  const [impostorCount, setImpostorCount] = useState(1);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState('');
  const [currentCategoryLabel, setCurrentCategoryLabel] = useState('');
  const [currentPlayerRevealIndex, setCurrentPlayerRevealIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);

  // --- Category Persistence ---
  const [customCategories, setCustomCategories] = useState<Record<string, string[]>>(getInitialCustomCategories());

  // --- UI State ---
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' | 'info' }[]>([]);
  const [managingCategory, setManagingCategory] = useState<string | null>(null);
  const [categoryWordInput, setCategoryWordInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(15);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ name: string, words: string[] } | null>(null);
  const [newCatName, setNewCatName] = useState('');
  
  useEffect(() => {
    setCategoryWordInput('');
  }, [managingCategory]);

  // --- Derived State ---
  const allCategories = useMemo(() => {
    const merged: Record<string, string[]> = { ...DEFAULT_CATEGORIES };
    for (const [cat, words] of Object.entries(customCategories)) {
      const catWords = words as string[];
      if (merged[cat]) {
        merged[cat] = Array.from(new Set([...(merged[cat] as string[]), ...catWords]));
      } else {
        merged[cat] = catWords;
      }
    }
    return merged;
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  // --- Handlers ---
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const changePlayerCount = (delta: number) => {
    const next = Math.max(2, playerNames.length + delta);
    if (next === playerNames.length) return;
    
    setPlayerNames(prev => {
      const updated = [...prev];
      if (delta > 0) {
        for (let i = prev.length; i < next; i++) {
          updated.push({ id: Math.random().toString(36).substr(2, 9), name: `Jugador ${i + 1}` });
        }
      } else {
        updated.splice(next);
      }
      return updated;
    });

    if (impostorCount >= next) {
      setImpostorCount(next - 1);
    }
  };

  const changeImpostorCount = (delta: number) => {
    const next = impostorCount + delta;
    if (next < 1 || next >= playerNames.length) return;
    setImpostorCount(next);
  };

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAllCategories = () => {
    setSelectedCategoryNames(new Set(Object.keys(allCategories)));
  };

  const clearCategorySelection = () => {
    setSelectedCategoryNames(new Set());
  };

  const createCategory = () => {
    const name = newCatName.trim();
    if (!name) return addToast('Nombre de categoría inválido', 'error');
    if (allCategories[name]) return addToast('Esa categoría ya existe', 'error');

    setCustomCategories(prev => ({ ...prev, [name]: [] }));
    setNewCatName('');
    setSelectedCategoryNames(prev => new Set(prev).add(name));
    addToast(`Categoría "${name}" creada`, 'success');
  };

  const deleteCustomCategory = (name: string) => {
    setCustomCategories(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setSelectedCategoryNames(prev => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    addToast(`Categoría "${name}" eliminada`, 'success');
  };

  const addWordsToCategory = (name: string, wordsStr: string) => {
    const words = wordsStr.split(/[,\n]+/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) return;

    setCustomCategories(prev => {
      const existing = prev[name] || [];
      const updated = Array.from(new Set([...existing, ...words]));
      return { ...prev, [name]: updated };
    });
    addToast(`${words.length} palabras añadidas`, 'success');
  };

  const removeWordFromCategory = (categoryName: string, wordToRemove: string) => {
    setCustomCategories(prev => {
      const words = prev[categoryName] || [];
      const updated = words.filter(w => w !== wordToRemove);
      return { ...prev, [categoryName]: updated };
    });
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return addToast('Escribe algo para generar', 'error');
    setIsAiLoading(true);
    setAiPreview(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, count: aiCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de IA');
      setAiPreview({ name: data.categoryName, words: data.words });
    } catch (e: any) {
      addToast(e.message, 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveAiCategory = () => {
    if (!aiPreview) return;
    setCustomCategories(prev => ({ ...prev, [aiPreview.name]: aiPreview.words }));
    setSelectedCategoryNames(prev => new Set(prev).add(aiPreview.name));
    setAiPreview(null);
    setAiPrompt('');
    addToast(`Categoría "${aiPreview.name}" guardada`, 'success');
  };

  const startGame = () => {
    if (selectedCategoryNames.size === 0) return addToast('Selecciona categorías', 'error');
    
    // Pick word
    const pool: string[] = [];
    selectedCategoryNames.forEach(name => {
      const words = allCategories[name];
      if (words) pool.push(...words);
    });

    if (pool.length === 0) return addToast('Las categorías están vacías', 'error');
    const word = pool[Math.floor(Math.random() * pool.length)];

    // Setup players
    const gamePlayers: Player[] = playerNames.map((p, i) => ({
      id: p.id,
      name: p.name.trim() || `Jugador ${i + 1}`,
      isImpostor: false
    }));

    // Assign impostors
    const indices = Array.from({ length: gamePlayers.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < impostorCount; i++) {
      gamePlayers[indices[i]].isImpostor = true;
    }

    setPlayers(gamePlayers);
    setCurrentWord(word);
    setCurrentCategoryLabel(
      selectedCategoryNames.size === 1 
        ? [...selectedCategoryNames][0] 
        : 'Mixto'
    );
    setCurrentPlayerRevealIndex(0);
    setIsCardFlipped(false);
    setStage('reveal');
  };

  const nextReveal = () => {
    if (currentPlayerRevealIndex < players.length - 1) {
      setIsCardFlipped(false);
      setTimeout(() => {
        setCurrentPlayerRevealIndex(prev => prev + 1);
      }, 300);
    } else {
      // Pick random starting player
      setStartingPlayerIndex(Math.floor(Math.random() * players.length));
      setStage('who-starts');
    }
  };

  // --- Sub-components (Views) ---

  const renderSetupView = () => (
    <div className="container mx-auto pb-20 max-w-2xl px-4">
      <div className="text-center py-12">
        <h1 className="hero-logo text-7xl uppercase text-white mb-2 leading-none">
          EL <span className="text-[var(--accent)]">IMPOSTOR</span>
        </h1>
        <p className="text-[var(--muted)] text-[10px] tracking-[0.3em] uppercase font-bold">
          ¿Quién no sabe la palabra?
        </p>
      </div>

      {/* Players Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 mb-5">
        <h2 className="card-title text-xl text-[var(--accent)] mb-4 flex items-center gap-2">
          <span>👥</span> JUGADORES
        </h2>
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2 font-bold">
            CANTIDAD DE JUGADORES
          </label>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-white hover:border-[var(--accent)] transition-colors" onClick={() => changePlayerCount(-1)}>
              <Minus size={18} />
            </button>
            <span className="w-12 text-center text-lg font-bold">{playerNames.length}</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-white hover:border-[var(--accent)] transition-colors" onClick={() => changePlayerCount(1)}>
              <Plus size={18} />
            </button>
          </div>
        </div>
        <Reorder.Group axis="y" values={playerNames} onReorder={setPlayerNames} className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {playerNames.map((p, i) => (
            <PlayerListItem 
              key={p.id}
              p={p}
              index={i}
              onNameChange={(newName) => {
                setPlayerNames(prev => prev.map(item => item.id === p.id ? { ...item, name: newName } : item));
              }}
              onRemove={() => {
                setPlayerNames(prev => prev.map(item => item.id === p.id ? { ...item, name: '' } : item));
              }}
            />
          ))}
        </Reorder.Group>
        <button 
          className="mt-4 flex items-center gap-2 text-[var(--muted)] text-[10px] uppercase tracking-widest hover:text-white transition-colors"
          onClick={() => {
            const shuffled = [...RANDOM_NAMES].sort(() => Math.random() - 0.5);
            setPlayerNames(prev => prev.map((p, i) => ({ ...p, name: shuffled[i % shuffled.length] })));
          }}
        >
          <Dices size={12} /> ALEATORIZAR NOMBRES
        </button>
      </div>

      {/* Impostors Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 mb-5">
        <h2 className="card-title text-xl text-[var(--accent)] mb-4 flex items-center gap-2">
           <span>🕵️</span> IMPOSTORES
        </h2>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2 font-bold">
            CANTIDAD DE IMPOSTORES
          </label>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-white hover:border-[var(--accent)] transition-colors" onClick={() => changeImpostorCount(-1)}>
              <Minus size={18} />
            </button>
            <span className="w-12 text-center text-lg font-bold">{impostorCount}</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-white hover:border-[var(--accent)] transition-colors" onClick={() => changeImpostorCount(1)}>
              <Plus size={18} />
            </button>
          </div>
          <p className="text-[var(--muted)] text-[9px] mt-3 uppercase tracking-[0.2em]">
            {impostorCount} impostor{impostorCount > 1 ? 'es' : ''} en partida de {playerNames.length} jugadores
          </p>
        </div>
      </div>

      {/* Categories Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 mb-5">
        <h2 className="card-title text-xl text-[var(--accent)] mb-4 flex items-center gap-2">
          <span>📁</span> CATEGORÍA DE PALABRAS
        </h2>
        
        <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-3 font-bold">
          CATEGORÍAS (PODÉS ELEGIR VARIAS O TODAS)
        </label>
        
        <div className="flex gap-2 mb-5">
          <button className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-md text-[var(--muted)] hover:text-white" onClick={selectAllCategories}>
             <Check size={10} /> Todas
          </button>
          <button className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-md text-[var(--muted)] hover:text-white" onClick={clearCategorySelection}>
             <X size={10} /> Ninguna
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 max-h-72 overflow-y-auto pr-2">
          {(Object.entries(allCategories) as [string, string[]][]).map(([name, words]) => (
            <div 
              key={name}
              onClick={() => toggleCategory(name)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-full border text-[11px] font-medium cursor-pointer transition-all ${
                selectedCategoryNames.has(name) 
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--border)] bg-transparent text-[var(--muted)]'
              }`}
            >
              <span>{name}</span>
              <span className={`text-[9px] ${selectedCategoryNames.has(name) ? 'text-white/60' : 'text-[var(--muted)]/50'}`}>
                {words.length}
              </span>
              {selectedCategoryNames.has(name) && (
                <button 
                  className="p-1 hover:text-white transition-opacity ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setManagingCategory(name);
                  }}
                >
                  <Search size={10} />
                </button>
              )}
            </div>
          ))}
        </div>

        <hr className="border-[var(--border)] mb-6 opacity-30" />

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2 font-bold">AGREGAR PALABRAS A CATEGORÍA EXISTENTE</label>
            <div className="flex gap-2">
              <select 
                className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs flex-1 outline-none text-white appearance-none"
                onChange={e => setManagingCategory(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {Object.keys(allCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button 
                className="bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] px-4 rounded-lg text-xs font-bold uppercase tracking-wider"
                onClick={() => managingCategory && setManagingCategory(managingCategory)}
              >
                + AGREGAR
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2 font-bold">CREAR NUEVA CATEGORÍA</label>
            <div className="flex gap-2">
              <input 
                className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs flex-1 outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]/50"
                placeholder="Ej: Bandas de rock"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCategory()}
              />
              <button className="bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors" onClick={createCategory}>Crear</button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Card */}
      <div className="bg-[var(--surface)] border border-dashed border-[#3a3a50] rounded-[var(--radius)] p-6 mb-8 mt-10">
        <h2 className="ai-card-title text-2xl text-[var(--orange)] mb-1 flex items-center gap-2">
          <span>✨</span> GENERAR CATEGORÍA CON IA
        </h2>
        <p className="text-[var(--muted)] text-[10px] uppercase tracking-[0.1em] mb-4 opacity-70">
          DESCRIBÍ CON TUS PALABRAS QUÉ TIPO DE CATEGORÍA QUERÉS Y LA IA LA CREA
        </p>
        
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2 font-bold">DESCRIPCIÓN / PROMPT</label>
            <input 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[var(--orange)] placeholder:text-[var(--muted)]/30"
              placeholder="Ej: palabras relacionadas con el espacio exterior"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className="block text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] mb-1 font-bold">CANTIDAD</label>
              <input type="number" className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none" value={aiCount} onChange={e => setAiCount(parseInt(e.target.value) || 15)} />
            </div>
            <button 
              className="flex-1 bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--orange)] hover:text-[var(--orange)] rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={generateWithAi}
              disabled={isAiLoading}
            >
              {isAiLoading ? <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-3 h-3" /> : <Sparkles size={14} />}
              {isAiLoading ? 'GENERANDO...' : '✨ GENERAR'}
            </button>
          </div>
        </div>

        {aiPreview && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-5 bg-[var(--surface2)] border border-[var(--border)] rounded-xl">
             <div className="font-head text-2xl text-[var(--orange)] mb-3">{aiPreview.name}</div>
             <div className="flex flex-wrap gap-1.5 mb-5">
               {aiPreview.words.map((w, i) => <span key={i} className="text-[9px] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text)]">{w}</span>)}
             </div>
             <div className="flex gap-2">
               <button className="flex-1 py-2.5 bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--success)]/30" onClick={saveAiCategory}>
                 ✓ GUARDAR CATEGORÍA
               </button>
               <button className="px-5 py-2.5 text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest hover:text-white" onClick={() => setAiPreview(null)}>DESCARTAR</button>
             </div>
          </motion.div>
        )}
      </div>

      <button 
        className="w-full py-5 bg-[var(--accent)] hover:bg-[var(--accent2)] text-white font-bold rounded-xl text-lg shadow-xl shadow-[var(--accent)]/20 transition-all flex items-center justify-center gap-3 font-head tracking-widest"
        onClick={startGame}
      >
        🎭 ¡COMENZAR PARTIDA!
      </button>
    </div>
  );

  const renderRevealView = () => {
    const player = players[currentPlayerRevealIndex];
    if (!player) return null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--muted)] mb-8 font-bold">
          JUGADOR {currentPlayerRevealIndex + 1} DE {players.length}
        </div>
        <h1 className="player-turn-name text-[clamp(2rem,6vw,3rem)] text-white mb-2 leading-none max-w-full truncate px-4">{player.name}</h1>
        <p className="text-[var(--muted)] text-[10px] uppercase tracking-[0.1em] mb-12 font-medium">TOCA LA CARTA PARA VER TU PALABRA</p>

        <div 
          className={`word-card w-full max-w-[300px] aspect-[16/10] cursor-pointer mx-auto ${isCardFlipped ? 'flipped' : ''}`}
          onClick={() => setIsCardFlipped(true)}
        >
          <div className="word-card-inner w-full h-full relative">
            <div className="word-card-front absolute inset-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center gap-3">
               <div className="text-4xl opacity-30">🃏</div>
               <div className="text-[10px] uppercase tracking-widest text-[var(--muted)]">TOCA PARA REVELAR</div>
            </div>
            <div className="word-card-back absolute inset-0 bg-[var(--surface)] border-2 border-[var(--accent)] rounded-2xl flex flex-col items-center justify-center gap-2 p-6 shadow-2xl shadow-[var(--accent)]/20">
               <div className="text-[9px] uppercase tracking-widest text-[var(--muted)]">{currentCategoryLabel}</div>
               <div className={`word-display leading-none tracking-tight ${player.isImpostor ? 'text-[var(--accent)] text-[clamp(1.5rem,6vw,2rem)]' : 'text-white text-[clamp(1.75rem,8vw,3rem)]'}`}>
                 {player.isImpostor ? '¡ERES EL IMPOSTOR!' : currentWord}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 min-h-16">
          <AnimatePresence>
            {isCardFlipped && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--accent)] hover:bg-[var(--accent2)] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
                onClick={nextReveal}
              >
                {currentPlayerRevealIndex < players.length - 1 ? 'Siguiente' : 'Finalizar'} <ChevronRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderWhoStartsView = () => {
    const startingPlayer = players[startingPlayerIndex];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-sm uppercase tracking-[0.4em] text-[var(--accent)] mb-4 font-bold">¡TODO LISTO!</div>
          <h2 className="font-head text-4xl text-white mb-12">EMPIEZA HABLANDO...</h2>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-[var(--surface)] border-2 border-[var(--accent)] p-8 rounded-[var(--radius)] mb-12 shadow-2xl shadow-[var(--accent)]/30"
          >
            <div className="font-head text-[clamp(2rem,10vw,4rem)] text-white uppercase tracking-wider break-words max-w-full leading-none">{startingPlayer.name}</div>
          </motion.div>

          <button 
            className="w-full py-5 bg-[var(--accent)] hover:bg-[var(--accent2)] text-white font-bold rounded-xl text-lg transition-transform active:scale-95"
            onClick={() => setStage('playing')}
          >
            ¡A JUGAR!
          </button>
        </motion.div>
      </div>
    );
  };

  const renderPlayingView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-[0.15]" 
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: ['#e63946','#f4a261','#2ec27e','#4cc9f0','#f8f8f2'][Math.floor(Math.random() * 5)],
              left: `${Math.random() * 100}%`,
              animation: `fall ${2 + Math.random() * 3}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <h1 className="start-big-text text-[clamp(5rem,20vw,8rem)] text-white leading-none">A<br/><span className="text-[var(--accent)]">JUGAR</span></h1>
        <p className="text-[var(--muted)] text-[clamp(10px,2.5vw,12px)] tracking-[0.4em] uppercase mt-6 mb-20 font-bold">¡EMPIECEN A DEBATIR!</p>
        
        <button 
          className="w-full py-4 bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] px-8 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all font-head tracking-[0.1em] text-sm"
          onClick={() => setStage('setup')}
        >
          <RotateCcw size={16} /> NUEVA PARTIDA
        </button>
      </div>
    </div>
  );

  const renderCategoryManagerModal = () => {
    if (!managingCategory) return null;
    const catName = managingCategory;
    const isCustom = !!customCategories[catName];
    const isDefault = !!DEFAULT_CATEGORIES[catName];
    
    const words = allCategories[catName] || [];

    const handleSaveWords = () => {
      addWordsToCategory(catName, categoryWordInput);
      setCategoryWordInput('');
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setManagingCategory(null)}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-lg p-7 max-h-[85dvh] flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="modal-title text-2xl text-[var(--accent)] tracking-wider">{catName}</h2>
            <button onClick={() => setManagingCategory(null)} className="p-2 hover:bg-[var(--surface2)] rounded-full transition-colors text-[var(--muted)] hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="mb-6 flex-1 overflow-y-auto pr-3">
            <label className="block text-[9px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4 font-bold">
              {isDefault && isCustom ? 'PALABRAS (INCLUYE PERSONALIZADAS Y DEFAULT)' : 'LISTADO DE PALABRAS'}
            </label>
            <div className="flex flex-wrap gap-2">
              {words.map((word, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-medium">{word}</span>
                  {(customCategories[catName]?.includes(word)) && (
                    <button 
                      className="text-[var(--accent)] opacity-40 hover:opacity-100 transition-opacity p-0.5"
                      onClick={() => removeWordFromCategory(catName, word)}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                  {DEFAULT_CATEGORIES[catName]?.includes(word) && (
                    <span className="text-[7px] text-[var(--muted)] opacity-40 uppercase tracking-tighter px-1 border border-[var(--border)] rounded">Fixed</span>
                  )}
                </div>
              ))}
              {words.length === 0 && <p className="text-[var(--muted)] text-xs italic opacity-50 py-4">Sin palabras aún...</p>}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6 mt-auto">
            <label className="block text-[9px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3 font-bold">AGREGAR PALABRAS</label>
            <textarea 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3.5 text-xs outline-none focus:border-[var(--accent)] mb-4 resize-none transition-all placeholder:text-[var(--muted)]/40"
              placeholder="Manzana, Banana, Kiwi..."
              rows={3}
              value={categoryWordInput}
              onChange={e => setCategoryWordInput(e.target.value)}
            />
            <div className="flex gap-2">
               <button className="flex-1 bg-[var(--accent)] text-white py-3.5 rounded-xl font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-[var(--accent2)] transition-all shadow-lg shadow-[var(--accent)]/20" onClick={handleSaveWords}>
                 GUARDAR PALABRAS
               </button>
               {isCustom && !isDefault && (
                 <button className="px-4 border border-[var(--accent)] text-[var(--accent)] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all" onClick={() => { 
                   if(confirm('¿Eliminar toda la categoría?')) {
                     deleteCustomCategory(catName);
                     setManagingCategory(null);
                   }
                 }}>
                   <Trash2 size={18} />
                 </button>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeIn' } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] select-none">
      <AnimatePresence mode="wait">
        {stage === 'setup' && (
          <motion.div key="setup" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderSetupView()}
          </motion.div>
        )}
        {stage === 'reveal' && (
          <motion.div key="reveal" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderRevealView()}
          </motion.div>
        )}
        {stage === 'who-starts' && (
          <motion.div key="who-starts" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderWhoStartsView()}
          </motion.div>
        )}
        {stage === 'playing' && (
          <motion.div key="playing" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderPlayingView()}
          </motion.div>
        )}
      </AnimatePresence>

      {renderCategoryManagerModal()}

      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <Toast 
              key={t.id} 
              message={t.message} 
              type={t.type} 
              onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
