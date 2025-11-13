"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  ChevronRight,
  Volume2,
  Maximize2,
  Keyboard,
  Languages,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  ArrowRightLeft,
  Home,              // <-- agregado aquí
} from "lucide-react";
import Link from "next/link";
import VideoLogo from "./VideoLogo";

// ⛔️ BORRAR esta línea si sigue en tu archivo:
// import { Keyboard, Languages, Maximize2, Home } from "lucide-react";

// JSONs
import criptografia1 from "../data/quizzes/criptografia1.json";
import forenseApps1 from "../data/quizzes/forense-apps1.json";

const QUIZ_MAP: Record<string, any> = {
  "criptografia1": criptografia1,
  "forense-apps1": forenseApps1,
};

type ExplItem =
  | { type: "text" | "title-h2" | "link" | "code"; content: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "image"; src: string; alt?: string }
  | { type: "divider" };

type AdaptedQ = {
  category?: string;
  // Texto por idioma
  word_en: string;
  word_es: string;
  // Opciones por idioma (cada una barajada por separado)
  options_en: string[];
  options_es: string[];
  // Respuesta correcta por idioma (texto + índice en el arreglo barajado)
  correct_en_text: string;
  correct_es_text: string;
  correct_en_index: number; // 0-based
  correct_es_index: number; // 0-based
  // Explicaciones por idioma
  explanation_en?: ExplItem[];
  explanation_es?: ExplItem[];
};

type ForceLang = "en-US" | "es-MX";

export default function InterviewQuiz({
  initialJson,
  initialQuizSlug,
  forceLanguage,
}: { initialJson?: any; forceLanguage?: ForceLang; initialQuizSlug?: string } = {}) {
  const [questions, setQuestions] = useState<AdaptedQ[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isJsonSelected, setIsJsonSelected] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);
  const quizContainerRef = useRef<HTMLDivElement | null>(null);
  const [responseMode, setResponseMode] = useState(true);

  // Lenguaje activo de las preguntas
  const [questionLanguage, setQuestionLanguage] = useState<ForceLang | "">("");
  const [selectedLanguage, setSelectedLanguage] = useState<ForceLang | null>(null);

  // Voces
  const [selectedQuestionVoice, setSelectedQuestionVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedAnswerVoice, setSelectedAnswerVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Paneles
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false); // SIEMPRE el otro idioma
  const [readQuestionsAloud, setReadQuestionsAloud] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  // Calificación
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [grade, setGrade] = useState(0);

  const isES = questionLanguage === "es-MX";
  const otherLang: ForceLang = isES ? "en-US" : "es-MX";

  useEffect(() => {
    const total = correctCount + incorrectCount;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    setGrade(pct);
  }, [correctCount, incorrectCount]);

  // ===================== Utilidades TTS =====================
  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch { /* no-op */ }
  }, []);

  const speakNow = useCallback((text?: string, voice?: SpeechSynthesisVoice | null, lang?: string, rate = 1) => {
    if (!text || !voice) return;
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    if (lang) u.lang = lang;
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }, [stopSpeaking]);

  const playQuestionAudio = useCallback(
    (text?: string) => {
      if (!text || !selectedQuestionVoice) return;
      speakNow(text, selectedQuestionVoice, questionLanguage || "en-US", 1);
    },
    [selectedQuestionVoice, questionLanguage, speakNow]
  );

  const playAnswerAudio = useCallback(
    (text?: string) => {
      if (!text || !selectedAnswerVoice || !readQuestionsAloud) return;
      speakNow(text, selectedAnswerVoice, questionLanguage || "en-US", 1);
    },
    [selectedAnswerVoice, questionLanguage, readQuestionsAloud, speakNow]
  );

  // ===================== Voces =====================
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices?.length) return;

      const pick = (lang: string) =>
        voices.find((v) => v.lang === lang && v.name.includes("Google")) ||
        voices.find((v) => v.lang === lang) || null;

      const vq = pick((questionLanguage || "en-US"));
      setSelectedQuestionVoice(vq);
      setSelectedAnswerVoice(vq);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, [questionLanguage]);

  // ===================== Carga inicial =====================
  useEffect(() => {
    if (isJsonSelected || (!initialJson && !initialQuizSlug && !selectedLanguage)) return;

    const langToUse = (forceLanguage ?? selectedLanguage ?? "es-MX") as ForceLang;
    if (!selectedLanguage && (initialJson || initialQuizSlug)) {
      setSelectedLanguage(langToUse);
    }

    let dataToLoad = initialJson;
    if (initialQuizSlug && QUIZ_MAP[initialQuizSlug]) {
      dataToLoad = QUIZ_MAP[initialQuizSlug];
    }

    if (dataToLoad && langToUse) {
      handleJsonSelection(dataToLoad, langToUse);
    }
  }, [initialJson, initialQuizSlug, forceLanguage, selectedLanguage, isJsonSelected]);

  // ===================== Helpers =====================
  const shuffleArray = <T,>(array: T[]) => array.slice().sort(() => Math.random() - 0.5);

  // Adaptación que guarda contenido para AMBOS idiomas
  const handleJsonSelection = (jsonFile: any, language: ForceLang) => {
    const adapted: AdaptedQ[] = jsonFile.Questions.map((q: any) => {
      const pickVariant = (lang: ForceLang) => {
        const pool = q["Question Text"][lang] as string[];
        const rnd = Math.floor(Math.random() * pool.length);
        return pool[rnd];
      };

      // En / Es
      const word_en = pickVariant("en-US");
      const word_es = pickVariant("es-MX");

      // Opciones barajadas por idioma
      const options_en = shuffleArray<string>([...q.Options["en-US"]]);
      const options_es = shuffleArray<string>([...q.Options["es-MX"]]);

      // Respuestas correctas (texto)
      const correct_en_text = q["Correct Answer"]["en-US"];
      const correct_es_text = q["Correct Answer"]["es-MX"];

      // Índices correctos según opciones barajadas (0-based)
      const correct_en_index = Math.max(0, options_en.indexOf(correct_en_text));
      const correct_es_index = Math.max(0, options_es.indexOf(correct_es_text));

      return {
        category: q.Category,
        word_en,
        word_es,
        options_en,
        options_es,
        correct_en_text,
        correct_es_text,
        correct_en_index,
        correct_es_index,
        explanation_en: q["Explanation"]["en-US"] ?? [],
        explanation_es: q["Explanation"]["es-MX"] ?? [],
      };
    });

    setQuestions(adapted);
    setQuestionLanguage(language);
    setIsJsonSelected(true);
  };

  // Leer explicación (solo items text/title-h2)
  const speakExplanation = (arr?: ExplItem[], lang?: ForceLang) => {
    if (!arr || !selectedAnswerVoice) return;
    arr.forEach((item) => {
      if (item.type === "text" || item.type === "title-h2") {
        speakNow(item.content, selectedAnswerVoice, lang || questionLanguage || "en-US", 1);
      }
    });
  };

  // ============== Selección de respuesta (con interrupción y mensaje “Correcto”) ==============
  const handleAnswerSelect = useCallback(
    (selectedOption: string) => {
      if (!questions.length) return;

      stopSpeaking(); // <- interrumpe lo que se esté leyendo

      const q = questions[currentQuestionIndex];
      const options = isES ? q.options_es : q.options_en;
      const correctText = isES ? q.correct_es_text : q.correct_en_text;

      if (selectedOption === correctText) {
        setCorrectCount((c) => c + 1);
        setScore((s) => s + 1);
        setShowCorrect(true);

        // “Correcto / Correct” + lectura de la respuesta
        const okMsg = isES ? "¡Correcto!" : "Correct!";
        speakNow(okMsg, selectedAnswerVoice, questionLanguage || "en-US", 1);
        // Pequeño retraso para encadenar lectura de la respuesta
        setTimeout(() => playAnswerAudio(correctText), 300);

        const fx = new Audio("/audio/correctanswer.mp3");
        fx.volume = 0.5;
        fx.play();

        setTimeout(() => {
          setShowCorrect(false);
          setSelectedAnswer(null);
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((i) => i + 1);
          } else {
            setShowResult(true);
          }
        }, 700);
      } else {
        setSelectedAnswer(selectedOption);
        setIncorrectCount((c) => c + 1);
        // Lee la opción elegida (interrumpiendo lo anterior ya se hizo)
        playAnswerAudio(selectedOption);
      }
    },
    [questions, currentQuestionIndex, isES, playAnswerAudio, speakNow, selectedAnswerVoice, questionLanguage, stopSpeaking]
  );

  useEffect(() => setSelectedAnswer(null), [currentQuestionIndex]);

  // ============== Atajos de teclado (con cancelación) ==============
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyPressTime < 300) return;
      setLastKeyPressTime(now);

      const q = questions[currentQuestionIndex];
      if (!q) return;

      const options = isES ? q.options_es : q.options_en;
      if (!options?.length) return;

      if (event.key === "Enter") {
        stopSpeaking();
        const text = isES ? q.word_es : q.word_en;
        playQuestionAudio(text);
        return;
      }
      if (event.key === "*") {
        setShowAnswer(true);
        const correctText = isES ? q.correct_es_text : q.correct_en_text;
        stopSpeaking();
        playAnswerAudio(correctText);
        return;
      }
      if (event.key === "-") {
        const correctText = isES ? q.correct_es_text : q.correct_en_text;
        handleAnswerSelect(correctText);
        return;
      }
      if (event.key === "0") {
        const fx = new Audio("/audio/correctanswer.mp3");
        fx.volume = 0.5;
        fx.play();
        setResponseMode((m) => !m);
        return;
      }
      if (event.key >= "1" && event.key <= "4") {
        const idx = parseInt(event.key) - 1;
        if (idx < 0 || idx >= options.length) return;
        const opt = options[idx];
        if (responseMode) {
          handleAnswerSelect(opt);
        } else {
          stopSpeaking();
          playAnswerAudio(opt);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions, currentQuestionIndex, responseMode, handleAnswerSelect, playQuestionAudio, playAnswerAudio, lastKeyPressTime, isES, stopSpeaking]);

  // Leer pregunta al cambiar (si está activo)
  useEffect(() => {
    if (questions.length > 0 && readQuestionsAloud) {
      const q = questions[currentQuestionIndex];
      const text = isES ? q.word_es : q.word_en;
      playQuestionAudio(text);
    }
  }, [currentQuestionIndex, questions, playQuestionAudio, readQuestionsAloud, isES]);

  // Fullscreen
  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  const enterFullScreen = () => {
    const el = quizContainerRef.current;
    if (!el) return;
    // @ts-expect-error vendor prefixes
    (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
  };

  // ===== Layout =====
  const activePanels =
    1 + (showExplanation ? 1 : 0) + (showTranslation ? 1 : 0);
  const gridColsClass =
    activePanels === 1 ? "md:grid-cols-1" :
      activePanels === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  const totalQuestions = questions.length || 1;
  const progressPct = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // UI
  return (
    <div
      ref={quizContainerRef}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white px-4 py-8 md:py-12"
    >
      {/* Header */}
      <header className="mx-auto max-w-6xl flex items-center justify-between gap-4">
        {/* Izquierda: logo + títulos */}
        <div className="flex items-center gap-3">
          {/* Logo animado pequeño */}


          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">UVA Learning · Super Quiz</h1>
            <p className="text-white/70 text-sm">
              Atajos: <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd> repetir ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">*</kbd> ver respuesta ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">-</kbd> contestar ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">0</kbd> escuchar
            </p>
          </div>
        </div>

        {/* Derecha: Inicio + idioma + fullscreen */}
        <div className="flex items-center gap-2">
          {/* Botón Inicio */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 ring-1 ring-white/10 transition"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>

          {/* Botón rápido para cambiar idioma activo */}
          {isJsonSelected && (
            <button
              onClick={() => {
                setShowTranslation(false); // opcional: cierra panel
                setQuestionLanguage(isES ? "en-US" : "es-MX");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 ring-1 ring-white/10 transition"
            >
              <Languages className="h-4 w-4" />
              {isES ? "Cambiar a Inglés" : "Switch to Spanish"}
            </button>
          )}

          {/* Badge de idioma actual */}
          <span className="hidden sm:inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-white/10 ring-1 ring-white/10">
            <Languages className="h-4 w-4" /> {questionLanguage || ""}
          </span>

          {/* Pantalla completa */}
          {!isFullScreen && (
            <button
              onClick={enterFullScreen}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 ring-1 ring-white/10 transition"
            >
              <Maximize2 className="h-4 w-4" /> Pantalla completa
            </button>
          )}
        </div>
      </header>
      {/* Barra de progreso */}
      <div className="mx-auto max-w-6xl mt-6">
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-white/70 flex items-center justify-between">
          <span>Pregunta {Math.min(currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}</span>
          <span>✔ {correctCount} · ✖ {incorrectCount} · Calificación: {grade}%</span>
        </div>
      </div>

      {/* Selección inicial (idioma) */}
      {!selectedLanguage && !initialQuizSlug ? (
        <section className="mx-auto max-w-3xl mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["en-US", "es-MX"] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => setSelectedLanguage(lng)}
              className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-left hover:ring-white/20 transition"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Languages className="h-5 w-5" /> {lng === "en-US" ? "Inglés" : "Español"}
              </h3>
              <p className="mt-2 text-white/70 text-sm">Elegir idioma del quiz</p>
            </button>
          ))}
        </section>
      ) : !isJsonSelected ? (
        // Selección de quiz
        <section className="mx-auto max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuizSelectCard title="Criptografía – Unidad 1" onClick={() => handleJsonSelection(criptografia1, (selectedLanguage as ForceLang))} />
          <QuizSelectCard title="Forense – Unidad 1" onClick={() => handleJsonSelection(forenseApps1, (selectedLanguage as ForceLang))} />
        </section>
      ) : !showResult && questions.length > 0 ? (
        <>
          {/* GRID adaptable */}
          <div className={`mx-auto mt-8 grid grid-cols-1 ${gridColsClass} gap-6 max-w-6xl`}>
            {/* Panel 1: Pregunta + opciones */}
            <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl md:text-2xl font-semibold leading-snug">
                {isES ? questions[currentQuestionIndex].word_es : questions[currentQuestionIndex].word_en}
              </h2>

              {showCorrect && (
                <div className="mt-4 inline-flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="h-5 w-5" /> {isES ? "¡Correcto!" : "Correct!"}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3">
                {(isES ? questions[currentQuestionIndex].options_es : questions[currentQuestionIndex].options_en)
                  .map((option, index) => (
                    <button
                      key={`${index}-${uuidv4()}`}
                      onClick={() => handleAnswerSelect(option)}
                      className={`group w-full text-left rounded-xl px-4 py-3 ring-1 transition shadow-sm shadow-black/10
                        ${selectedAnswer === option ? "bg-amber-600/90 ring-amber-300/30" : "bg-white/7.5 hover:bg-white/12 ring-white/10"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base md:text-lg font-medium">{index + 1}. {option}</span>
                        <ChevronRight className="h-5 w-5 shrink-0 opacity-60 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  ))}
              </div>
            </section>

            {/* Panel 2: Explicación (en idioma activo) */}
            {showExplanation && (
              <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Info className="h-5 w-5" /> {isES ? "Explicación" : "Explanation"}</h3>
                  <button
                    onClick={() =>
                      speakExplanation(
                        isES ? questions[currentQuestionIndex].explanation_es : questions[currentQuestionIndex].explanation_en,
                        questionLanguage as ForceLang
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-sm font-medium"
                  >
                    <Volume2 className="h-4 w-4" /> {isES ? "Leer" : "Read"}
                  </button>
                </div>
                <div className="mt-3 space-y-3 text-left text-white/90">
                  {(isES ? questions[currentQuestionIndex].explanation_es : questions[currentQuestionIndex].explanation_en)?.map((item, index) => {
                    if (item.type === "text") return <p key={index}>{item.content}</p>;
                    if (item.type === "title-h2") return <h2 key={index} className="text-xl font-bold text-white">{item.content}</h2>;
                    if (item.type === "link") return (
                      <a key={index} href={item.content} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">{item.content}</a>
                    );
                    if (item.type === "code") return (
                      <pre key={index} className="bg-black/60 text-emerald-300 p-3 rounded-lg overflow-x-auto text-sm"><code>{item.content}</code></pre>
                    );
                    if (item.type === "ul") return (
                      <ul key={index} className="list-disc list-inside space-y-1">{item.items.map((li, i) => <li key={i}>{li}</li>)}</ul>
                    );
                    if (item.type === "ol") return (
                      <ol key={index} className="list-decimal list-inside space-y-1">{item.items.map((li, i) => <li key={i}>{li}</li>)}</ol>
                    );
                    if (item.type === "image") return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={index} src={item.src} alt={item.alt || "image"} className="rounded-xl border border-white/10 shadow-md max-w-full" />
                    );
                    if (item.type === "divider") return <hr key={index} className="border-white/10 my-4" />;
                    return null;
                  })}
                </div>
              </section>
            )}

            {/* Panel 3: Traducción (siempre muestra el otro idioma) */}
            {showTranslation && (
              <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6 shadow-xl shadow-black/20">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Languages className="h-5 w-5" /> {isES ? "Pregunta en Inglés" : "Question in Spanish"}
                </h3>

                <p className="mt-2 text-white/90">
                  {isES ? questions[currentQuestionIndex].word_en : questions[currentQuestionIndex].word_es}
                </p>

                <h4 className="mt-4 font-semibold">{isES ? "Options" : "Opciones"}</h4>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  {(isES ? questions[currentQuestionIndex].options_en : questions[currentQuestionIndex].options_es).map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>

                <h4 className="mt-4 font-semibold">{isES ? "Explanation" : "Explicación"}</h4>
                <div className="mt-1 space-y-3 text-white/90">
                  {(isES ? questions[currentQuestionIndex].explanation_en : questions[currentQuestionIndex].explanation_es)?.map((item, index) => {
                    if (item.type === "text") return <p key={index}>{item.content}</p>;
                    if (item.type === "title-h2") return <h2 key={index} className="text-xl font-bold text-white">{item.content}</h2>;
                    if (item.type === "link") return (
                      <a key={index} href={item.content} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">{item.content}</a>
                    );
                    if (item.type === "code") return (
                      <pre key={index} className="bg-black/60 text-emerald-300 p-3 rounded-lg overflow-x-auto text-sm"><code>{item.content}</code></pre>
                    );
                    if (item.type === "ul") return (
                      <ul key={index} className="list-disc list-inside space-y-1">{item.items.map((li, i) => <li key={i}>{li}</li>)}</ul>
                    );
                    if (item.type === "ol") return (
                      <ol key={index} className="list-decimal list-inside space-y-1">{item.items.map((li, i) => <li key={i}>{li}</li>)}</ol>
                    );
                    if (item.type === "image") return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={index} src={item.src} alt={item.alt || "image"} className="rounded-xl border border-white/10 shadow-md max-w-full" />
                    );
                    if (item.type === "divider") return <hr key={index} className="border-white/10 my-4" />;
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    speakExplanation(
                      isES ? questions[currentQuestionIndex].explanation_en : questions[currentQuestionIndex].explanation_es,
                      otherLang
                    )
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-sm font-medium"
                >
                  <Volume2 className="h-4 w-4" /> {isES ? "Read explanation" : "Leer explicación"}
                </button>
              </section>
            )}
          </div>

          {/* Toolbar de acciones */}
          <div className="mx-auto max-w-6xl mt-6 flex flex-wrap items-center justify-center gap-2">
            <ActionToggle active={readQuestionsAloud} onClick={() => setReadQuestionsAloud(v => !v)}>
              <Volume2 className="h-4 w-4" /> {readQuestionsAloud ? (isES ? "Lectura activada" : "Reading ON") : (isES ? "Lectura desactivada" : "Reading OFF")}
            </ActionToggle>
            <ActionButton onClick={() => setShowExplanation(v => !v)}>
              <Info className="h-4 w-4" /> {showExplanation ? (isES ? "Ocultar explicación" : "Hide explanation") : (isES ? "Explicación" : "Explanation")}
            </ActionButton>
            <ActionButton onClick={() => setShowAnswer(v => !v)}>
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showAnswer ? (isES ? "Ocultar respuesta" : "Hide answer") : (isES ? "Mostrar respuesta" : "Show answer")}
            </ActionButton>
            <ActionButton onClick={() => setShowTranslation(v => !v)}>
              <Languages className="h-4 w-4" /> {showTranslation ? (isES ? "Ocultar traducción" : "Hide translation") : (isES ? "Traducción al inglés" : "Spanish translation")}
            </ActionButton>
            <ActionButton onClick={() => setResponseMode(m => !m)}>
              <ArrowRightLeft className="h-4 w-4" /> {responseMode ? (isES ? "Modo respuesta ON" : "Answer mode ON") : (isES ? "Modo escuchar ON" : "Listen mode ON")}
            </ActionButton>
            <ActionButton
              onClick={() => setShowLogo(s => !s)}
            >
              {showLogo ? "Ocultar logo" : "Mostrar logo"}
            </ActionButton>


          </div>
        </>
      ) : (
        <div className="mx-auto max-w-lg mt-16 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{isES ? "Resultado Final" : "Final Result"}</h1>
          <p className="text-lg">{isES ? "Tu puntaje es" : "Your score"} {score}/{questions.length}</p>
          <div className="mt-4 text-sm text-white/70">✔ {correctCount} · ✖ {incorrectCount}</div>
          <button
            onClick={() => {
              stopSpeaking();
              setIsJsonSelected(false);
              setScore(0);
              setCorrectCount(0);
              setIncorrectCount(0);
              setShowResult(false);
              setCurrentQuestionIndex(0);
              setShowTranslation(false);
              setShowExplanation(false);
              setShowAnswer(false);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 font-medium"
          >
            {isES ? "Reiniciar" : "Restart"}
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl flex pt-4 flex-col md:flex-row items-center justify-between gap-6 ">

        {/* === LOGO GRANDE/ESTÉTICO === */}
        {showLogo && (
          <div className="flex items-center justify-center w-full md:w-1/2 h-32 overflow-hidden rounded-xl transition-all duration-300">
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            >
              <source src="/videologo.webm" type="video/webm" />
              <source src="/videologo.mp4" type="video/mp4" />
            </video>
          </div>
        )}



        {/* === RECUADRO DE INSTRUCCIONES === */}
        <div
  className={`
    w-full
    ${showLogo ? "md:w-2/3" : "md:w-1/2"}
    mx-auto
    rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-6
    transition-all duration-300
  `}
>


          {showAnswer && !!questions.length && (
            <div className="mb-4 inline-flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>
                {isES ? "Respuesta" : "Answer"}:{" "}
                <strong>
                  {isES
                    ? questions[currentQuestionIndex].correct_es_text
                    : questions[currentQuestionIndex].correct_en_text}
                </strong>
              </span>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {isES ? "Instrucciones" : "Instructions"}
          </h3>

          <ul className="grid gap-2 text-white/80 text-sm md:grid-cols-2">
            <li className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10">Enter</kbd>
              {isES ? "Repetir pregunta" : "Repeat question"}
            </li>
            <li className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10">*</kbd>
              {isES ? "Mostrar respuesta" : "Show answer"}
            </li>
            <li className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10">-</kbd>
              {isES ? "Contestar y avanzar" : "Answer & next"}
            </li>
            <li className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10">0</kbd>
              {isES ? "Alternar escuchar/responder" : "Toggle listen/answer"}
            </li>
          </ul>

        </div>
      </div>

      {/* Ir a pregunta específica */}
      <div className="mx-auto max-w-md mt-6 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5">
        <h3 className="font-semibold mb-2">{isES ? "Ir a una pregunta específica" : "Go to specific question"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement & { pregunta: { value: string } };
            const value = form.pregunta.value;
            const index = parseInt(value);
            if (!isNaN(index) && index >= 1 && index <= questions.length) {
              stopSpeaking();
              setCurrentQuestionIndex(index - 1);
              setSelectedAnswer(null);
              setShowAnswer(false);
              setShowCorrect(false);
              const q = questions[index - 1];
              const text = isES ? q.word_es : q.word_en;
              playQuestionAudio(text);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="number"
            name="pregunta"
            min={1}
            max={questions.length}
            className="w-full px-3 py-2 rounded-lg text-black"
            placeholder={`${isES ? "Número entre" : "Number between"} 1 ${isES ? "y" : "and"} ${questions.length || 1}`}
          />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2 font-medium">
            {isES ? "Ir" : "Go"} <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function QuizSelectCard({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-left hover:ring-white/20 transition shadow-xl shadow-black/20"
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-indigo-500/10 transition" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-white/70 text-sm">Comenzar este cuestionario</p>
      <div className="mt-4 inline-flex items-center gap-2 text-cyan-300">
        Iniciar <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl bg-white/8 hover:bg-white/12 px-3 py-2 ring-1 ring-white/10 backdrop-blur transition">
      {children}
    </button>
  );
}

function ActionToggle({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ring-1 backdrop-blur transition ${active ? "bg-emerald-600/90 hover:bg-emerald-600 ring-emerald-300/30" : "bg-white/8 hover:bg-white/12 ring-white/10"}`}>
      {children}
    </button>
  );
}
