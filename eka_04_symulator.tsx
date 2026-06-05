import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, CheckCircle, XCircle, ArrowRight, Home, Upload, 
  BarChart3, Layers, BookOpen, Trash2, RefreshCcw, Keyboard,
  Database, Download, Search, ChevronLeft, ChevronRight, Edit3 
} from 'lucide-react';

const DEFAULT_QUESTIONS = [
  {
    categoryName: "Kadry i płace",
    text: "Pracownik zatrudniony w wymiarze 3/4 etatu otrzymuje wynagrodzenie w wysokości 25,00 zł za godzinę pracy. W grudniu pracował przez 20 dni po 6 godzin. Jakie wynagrodzenie brutto otrzymał?",
    options: ["3 000,00 zł", "3 750,00 zł", "2 250,00 zł", "4 000,00 zł"],
    correct: 0
  },
  {
    categoryName: "Finanse i podatki",
    text: "Sklep meblowy ustala marżę detaliczną na poziomie 25% od ceny zakupu. Sprzedaż podlega 23% stawce VAT. Klient zakupił krzesło za 246 zł brutto. Jaka była marża uzyskana przez sklep?",
    options: ["46,00 zł", "40,00 zł", "50,00 zł", "61,50 zł"],
    correct: 1
  },
  {
    categoryName: "Rachunkowość",
    text: "Na jakich kontach ujmuje się składniki występujące w pozycjach aktywów i pasywów, np.: „Środki trwałe”, „Kredyty bankowe”?",
    options: ["Kontach bilansowych", "Kontach wynikowych", "Kontach korygujących", "Kontach pozabilansowych"],
    correct: 0
  },
  {
    categoryName: "Rachunkowość",
    text: "Zasada podwójnego zapisu oznacza, że każdą operację gospodarczą należy zaksięgować:",
    options: ["Na co najmniej dwóch różnych kontach, po przeciwnych stronach, w tej samej kwocie", "Na dwóch kontach bilansowych, po tej samej stronie", "Tylko w dzienniku chronologicznym", "W księdze głównej i księgach pomocniczych w różnych kwotach"],
    correct: 0
  },
  {
    categoryName: "Finanse i podatki",
    text: "Firma podpisała umowę o dzieło z wykonawcą. Wynagrodzenie brutto wynosi 5 000 zł, a koszty uzyskania przychodu to 50%. Podstawa opodatkowania wyniesie:",
    options: ["2 500,00 zł", "5 000,00 zł", "4 000,00 zł", "1 250,00 zł"],
    correct: 0
  },
  {
    categoryName: "Gospodarka magazynowa",
    text: "Dokumentem potwierdzającym wydanie materiałów z magazynu do zużycia wewnątrz przedsiębiorstwa (np. na produkcję) jest:",
    options: ["Wz - Wydanie na zewnątrz", "Pz - Przyjęcie z zewnątrz", "Rw - Rozchód wewnętrzny", "Mm - Przesunięcie międzymagazynowe"],
    correct: 2
  },
  {
    categoryName: "Kadry i płace",
    text: "Podstawę wymiaru składek na ubezpieczenia społeczne pracownika zatrudnionego na umowę o pracę stanowi:",
    options: ["Wynagrodzenie netto", "Przychód pracownika z tytułu zatrudnienia (wynagrodzenie brutto)", "Wynagrodzenie brutto pomniejszone o podatek", "Kwota wolna od podatku"],
    correct: 1
  },
  {
    categoryName: "Prawo gospodarcze",
    text: "Która z wymienionych spółek jest spółką kapitałową, posiadającą pełną osobowość prawną?",
    options: ["Spółka jawna", "Spółka partnerska", "Spółka komandytowa", "Spółka z ograniczoną odpowiedzialnością"],
    correct: 3
  },
  {
    categoryName: "Bezpieczeństwo i higiena pracy",
    text: "Szkolenie okresowe BHP pracownika zatrudnionego na stanowisku robotniczym przeprowadza się nie rzadziej niż raz na:",
    options: ["1 rok", "3 lata", "5 lat", "6 miesięcy"],
    correct: 1
  },
  {
    categoryName: "Analiza ekonomiczna",
    text: "Wskaźnik bieżącej płynności finansowej oblicza się jako stosunek:",
    options: ["Aktywów obrotowych do zobowiązań krótkoterminowych", "Zobowiązań ogółem do kapitałów własnych", "Zysku netto do przychodów ze sprzedaży", "Aktywów trwałych do zobowiązań długoterminowych"],
    correct: 0
  },
  {
    categoryName: "Marketing i zarządzanie",
    text: "Faza cyklu życia produktu, w której następuje najbardziej gwałtowny wzrost sprzedaży i zysków to faza:",
    options: ["Wprowadzenia na rynek", "Wzrostu", "Dojrzałości", "Spadku"],
    correct: 1
  },
  {
    categoryName: "Gospodarka magazynowa",
    text: "Zapas utrzymywany w celu zabezpieczenia ciągłości produkcji na wypadek nieprzewidzianych zakłóceń w dostawach to zapas:",
    options: ["Bieżący", "Rotujący", "Rezerwowy (bezpieczeństwa)", "Spekulacyjny"],
    correct: 2
  }
];

export default function App() {
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [view, setView] = useState('menu'); // menu | quiz | summary
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const [globalStats, setGlobalStats] = useState({ totalAnswered: 0, totalCorrect: 0 });

  // --- NOWE STANY: EDYTOR BAZY ---
  const [dbPage, setDbPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Load from LocalStorage
  useEffect(() => {
    try {
      const savedQ = localStorage.getItem('eka04_db');
      if (savedQ) setQuestions(JSON.parse(savedQ));
      
      const savedS = localStorage.getItem('eka04_stats');
      if (savedS) setGlobalStats(JSON.parse(savedS));
    } catch(e) {
      console.error("Storage load error", e);
    }
  }, []);

  const categoriesMap = useMemo(() => {
    const map = {};
    questions.forEach(q => {
      map[q.categoryName] = (map[q.categoryName] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]); // Sort by count desc
  }, [questions]);

  const startQuiz = (category) => {
    let pool = [];
    if (category === 'ALL_RANDOM') {
      pool = [...questions].sort(() => 0.5 - Math.random()).slice(0, 40); // 40 questions exam format
    } else {
      pool = questions.filter(q => q.categoryName === category);
    }
    
    if (pool.length === 0) return;
    
    setCurrentQueue(pool);
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setView('quiz');
  };

  const handleAnswer = (idx) => {
    if (isAnswered) return;
    
    setSelectedOption(idx);
    setIsAnswered(true);
    
    const q = currentQueue[currentIndex];
    const isCorrect = idx === q.correct;
    if (isCorrect) setScore(s => s + 1);

    // Update stats
    setGlobalStats(prev => {
      const next = { 
        totalAnswered: prev.totalAnswered + 1, 
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0) 
      };
      localStorage.setItem('eka04_stats', JSON.stringify(next));
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < currentQueue.length) {
      setCurrentIndex(c => c + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setView('summary');
    }
  };

  // Keyboard Shortcuts integration
  useEffect(() => {
    const handleKey = (e) => {
      if (view !== 'quiz') return;
      if (e.key === ' ' && !isAnswered) e.preventDefault(); // Prevent scroll only when choosing

      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleAnswer(0);
        if (e.key === '2' || e.key.toLowerCase() === 'b') handleAnswer(1);
        if (e.key === '3' || e.key.toLowerCase() === 'c') handleAnswer(2);
        if (e.key === '4' || e.key.toLowerCase() === 'd') handleAnswer(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, isAnswered, currentIndex, currentQueue]); // Dependencies ensure fresh state

  // File Upload Logic
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text && Array.isArray(parsed[0].options)) {
          setQuestions(parsed);
          localStorage.setItem('eka04_db', JSON.stringify(parsed));
          alert(`Pomyślnie wgrano nową bazę: ${parsed.length} pytań!`);
        } else {
          alert('Błąd! Plik JSON ma niepoprawny format.');
        }
      } catch(err) {
        alert('Nie udało się odczytać pliku JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const resetDB = () => {
    if(confirm('Czy na pewno chcesz przywrócić domyślną bazę pytań (utracisz wgrywane pliki)?')) {
       setQuestions(DEFAULT_QUESTIONS);
       localStorage.removeItem('eka04_db');
    }
  };

  const resetStats = () => {
    if(confirm('Zresetować Twoje statystyki rozwiązywania?')) {
       setGlobalStats({ totalAnswered: 0, totalCorrect: 0 });
       localStorage.removeItem('eka04_stats');
    }
  };

  // --- LOGIKA EDYTORA BAZY DANYCH ---
  const updateCorrectAnswer = (globalIndex, newCorrect) => {
    setQuestions(prev => {
      const next = [...prev];
      next[globalIndex] = { ...next[globalIndex], correct: newCorrect };
      localStorage.setItem('eka04_db', JSON.stringify(next));
      return next;
    });
  };

  const exportDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "EKA_04_Naprawiona_Baza.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) return questions;
    return questions.filter(q => 
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  const totalDbPages = Math.ceil(filteredQuestions.length / 20);
  const dbItems = filteredQuestions.slice(dbPage * 20, (dbPage + 1) * 20);

  // UI Helpers
  const getOptionStyle = (idx) => {
    if (!isAnswered) {
      return selectedOption === idx 
        ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.01]' 
        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-sm bg-white cursor-pointer';
    }
    const q = currentQueue[currentIndex];
    if (idx === q.correct) {
      return 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm';
    }
    if (idx === selectedOption) {
      return 'border-rose-500 bg-rose-50 text-rose-900 shadow-sm';
    }
    return 'border-slate-100 bg-slate-50 text-slate-400 opacity-50 cursor-default'; 
  };

  const getAccuracy = () => {
    if (globalStats.totalAnswered === 0) return 0;
    return Math.round((globalStats.totalCorrect / globalStats.totalAnswered) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Layers size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">EKA.04 Master</h1>
          </div>
          {view !== 'menu' && (
            <button 
              onClick={() => setView('menu')}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
            >
              <Home size={18} /> Menu Główne
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        
        {/* --- MENU VIEW --- */}
        {view === 'menu' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><BookOpen size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Baza pytań</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><CheckCircle size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Rozwiązano (Ogółem)</p>
                  <p className="text-2xl font-bold">{globalStats.totalAnswered}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><BarChart3 size={24} /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Skuteczność</p>
                  <p className="text-2xl font-bold">{getAccuracy()}%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Gotowy na test?</h2>
                <p className="text-indigo-100 mb-6 max-w-md">Rozwiąż próbny egzamin ze wszystkich kategorii lub wybierz konkretny dział, by przećwiczyć braki.</p>
                <button 
                  onClick={() => startQuiz('ALL_RANDOM')}
                  className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 hover:scale-105 transition-all shadow-md flex items-center gap-2"
                >
                  <Play size={20} fill="currentColor" /> Rozpocznij Egzamin (Losowe)
                </button>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
                <Layers size={180} />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Wybierz kategorię
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categoriesMap.map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => startQuiz(name)}
                    className="bg-white border border-slate-200 p-5 rounded-2xl text-left hover:border-indigo-400 hover:shadow-md transition-all group"
                  >
                    <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 mb-1">{name}</h4>
                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{count} pytań</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings / DB Tools */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Narzędzia i Baza Danych</h3>
              <div className="flex flex-wrap gap-4">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Upload size={16} /> Importuj własną bazę (JSON)
                  <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={resetDB} className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <RefreshCcw size={16} /> Przywróć domyślną bazę
                </button>
                <button onClick={resetStats} className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Trash2 size={16} /> Zresetuj statystyki
            </button>
            <button onClick={() => { setView('database'); setDbPage(0); setSearchTerm(''); }} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
              <Database size={16} /> Edytor Bazy Pytań (Ustal odpowiedzi)
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-4 max-w-2xl leading-relaxed">
                <Keyboard size={14} className="inline mr-1 mb-0.5" />
                <strong>Wskazówka:</strong> Podczas quizu używaj klawiszy <kbd className="bg-slate-200 px-1 rounded">A B C D</kbd> (lub 1-4) do wyboru odpowiedzi, a klawisza <kbd className="bg-slate-200 px-1 rounded">Enter</kbd> aby przejść dalej! To znacznie przyspiesza rozwiązywanie.
              </p>
            </div>

          </div>
        )}

        {/* --- QUIZ VIEW --- */}
        {view === 'quiz' && currentQueue.length > 0 && (
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                <span>Pytanie {currentIndex + 1} z {currentQueue.length}</span>
                <span className="text-indigo-600">{currentQueue[currentIndex].categoryName}</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentIndex + 1) / currentQueue.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                {currentQueue[currentIndex].text}
              </h2>
              
              <div className="space-y-3">
                {currentQueue[currentIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 flex items-start sm:items-center gap-4 ${getOptionStyle(i)}`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold mt-0.5 sm:mt-0
                      ${isAnswered && i === currentQueue[currentIndex].correct ? 'bg-emerald-200 text-emerald-800' : 
                        (isAnswered && i === selectedOption ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600')}`}
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    <span className="flex-1 text-base sm:text-lg">{opt}</span>
                    
                    {/* Icons for outcome */}
                  {isAnswered && i === currentQueue[currentIndex].correct && <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} />}
                  {isAnswered && selectedOption === i && i !== currentQueue[currentIndex].correct && <XCircle className="text-rose-500 flex-shrink-0" size={24} />}
                </button>
              ))}
            </div>

            {/* Next Button Area */}
            <div className="mt-8 h-14">
              {isAnswered && (
                <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={handleNext} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    {currentIndex < currentQueue.length - 1 ? 'Następne pytanie' : 'Zakończ i pokaż wynik'}
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUMMARY VIEW --- */}
      {view === 'summary' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            {score / currentQueue.length >= 0.5 ? 
              <CheckCircle size={48} className="text-emerald-500" /> : 
              <XCircle size={48} className="text-rose-500" />
            }
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Podsumowanie Sesji</h2>
          <p className="text-slate-500 mb-8">Poniżej znajdziesz swój wynik z rozwiązanych pytań.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <div className="text-5xl font-black text-indigo-600 mb-2">
              {score} <span className="text-2xl text-slate-400 font-medium">/ {currentQueue.length}</span>
            </div>
            <p className="font-semibold text-slate-700">
              Skuteczność: {Math.round((score / currentQueue.length) * 100)}%
            </p>
            
            <div className="mt-6 text-sm font-medium">
              {score / currentQueue.length >= 0.5 ? (
                <span className="text-emerald-600 bg-emerald-100 px-4 py-2 rounded-full">Zdane (Wymagane minimum CKE: 50%)</span>
              ) : (
                <span className="text-rose-600 bg-rose-100 px-4 py-2 rounded-full">Niezdane (Wymagane minimum CKE: 50%)</span>
              )}
            </div>
          </div>

          <button 
            onClick={() => setView('menu')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 w-full sm:w-auto"
          >
            Wróć do Menu Głównego
          </button>
        </div>
      )}

      {/* --- DATABASE EDITOR VIEW --- */}
      {view === 'database' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="text-indigo-600" /> Edytor Bazy ({filteredQuestions.length} pytań)
              </h2>
              <p className="text-sm text-slate-500">Zaznacz poprawne odpowiedzi. Zmiany zapisują się automatycznie.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Szukaj pytania..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setDbPage(0); }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button onClick={exportDatabase} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
                <Download size={18} /> <span className="hidden sm:inline">Pobierz JSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {dbItems.map((q, localIndex) => {
              const globalIndex = questions.findIndex(mainQ => mainQ.text === q.text);
              
              return (
                <div key={globalIndex} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-md">{q.categoryName}</span>
                    <span className="text-xs text-slate-400 font-medium py-1">ID: {globalIndex}</span>
                  </div>
                  <p className="font-semibold text-slate-800 mb-4">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => updateCorrectAnswer(globalIndex, optIdx)}
                        className={`text-left p-3 rounded-lg border text-sm transition-all flex items-start gap-3
                          ${q.correct === optIdx 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold
                          ${q.correct === optIdx ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </span>
                        <span className="mt-0.5">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {totalDbPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <button 
                onClick={() => setDbPage(p => Math.max(0, p - 1))}
                disabled={dbPage === 0}
                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-600">
                Strona {dbPage + 1} z {totalDbPages}
              </span>
              <button 
                onClick={() => setDbPage(p => Math.min(totalDbPages - 1, p + 1))}
                disabled={dbPage === totalDbPages - 1}
                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      </main>
    </div>
  );
}