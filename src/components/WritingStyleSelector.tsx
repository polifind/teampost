"use client";

import { useState, useEffect } from "react";

interface WritingStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  exampleOpener: string;
  bestFor: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    text: string;
    style: string;
  }>;
}

interface WritingStyleSelectorProps {
  onStyleSelected: (styleId: string) => void;
  currentStyleId?: string | null;
  mode?: "cards" | "quiz";
}

export function WritingStyleSelector({
  onStyleSelected,
  currentStyleId,
  mode = "cards",
}: WritingStyleSelectorProps) {
  const [styles, setStyles] = useState<WritingStyle[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(
    currentStyleId || null
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(mode === "quiz");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await fetch("/api/writing-style");
      const data = await response.json();
      setStyles(data.availableStyles);
      setQuizQuestions(data.quizQuestions);
      if (data.currentStyleId) {
        setSelectedStyle(data.currentStyleId);
      }
    } catch (error) {
      console.error("Failed to fetch styles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSelect = async (styleId: string) => {
    setSaving(true);
    try {
      const response = await fetch("/api/writing-style", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleId }),
      });

      if (response.ok) {
        setSelectedStyle(styleId);
        onStyleSelected(styleId);
      }
    } catch (error) {
      console.error("Failed to save style:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuizAnswer = (questionId: string, styleId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: styleId }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/writing-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedStyle(data.primaryStyle);
        setIsQuizMode(false);
        onStyleSelected(data.primaryStyle);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Quiz mode
  if (isQuizMode && quizQuestions.length > 0) {
    const question = quizQuestions[currentQuestion];
    const isComplete = Object.keys(quizAnswers).length === quizQuestions.length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Discover Your Writing Style
          </h3>
          <p className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-accent-coral h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900 mb-4">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(question.id, option.style)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  quizAnswers[question.id] === option.style
                    ? "border-accent-coral bg-accent-coral/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          )}
          {isComplete && (
            <button
              onClick={submitQuiz}
              disabled={saving}
              className="px-6 py-2 bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 disabled:opacity-50 ml-auto"
            >
              {saving ? "Saving..." : "See My Style"}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsQuizMode(false)}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Skip quiz and choose manually
        </button>
      </div>
    );
  }

  // Card selection mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Choose Your Writing Style
          </h3>
          <p className="text-sm text-gray-600">
            Select the style that best matches how you want to come across on LinkedIn
          </p>
        </div>
        {quizQuestions.length > 0 && (
          <button
            onClick={() => {
              setIsQuizMode(true);
              setCurrentQuestion(0);
              setQuizAnswers({});
            }}
            className="text-sm text-accent-coral hover:underline"
          >
            Take the quiz instead
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {styles.map((style) => (
          <div
            key={style.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedStyle === style.id
                ? "border-accent-coral bg-accent-coral/5 ring-2 ring-accent-coral/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleStyleSelect(style.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{style.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{style.description}</p>
              </div>
              {selectedStyle === style.id && (
                <span className="text-accent-coral ml-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedStyle(expandedStyle === style.id ? null : style.id);
              }}
              className="text-xs text-accent-coral hover:underline mt-2"
            >
              {expandedStyle === style.id ? "Hide example" : "See example"}
            </button>

            {expandedStyle === style.id && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-sm text-gray-700 whitespace-pre-line">
                {style.exampleOpener}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              {style.bestFor.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {saving && (
        <div className="text-center text-sm text-gray-500">Saving...</div>
      )}
    </div>
  );
}
