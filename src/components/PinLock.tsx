"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "app_unlocked";
const PIN_LENGTH = 4;

export default function PinLock({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setUnlocked(stored === "true");
  }, []);

  const submit = useCallback(
    (pin: string) => {
      const correct = process.env.NEXT_PUBLIC_PIN_CODE ?? "1234";
      if (pin === correct) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setUnlocked(true);
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits([]);
        }, 600);
      }
    },
    []
  );

  const handleDigit = useCallback(
    (d: string) => {
      if (shake) return;
      setDigits((prev) => {
        const next = [...prev, d].slice(0, PIN_LENGTH);
        if (next.length === PIN_LENGTH) {
          setTimeout(() => submit(next.join("")), 50);
        }
        return next;
      });
    },
    [shake, submit]
  );

  const handleBackspace = useCallback(() => {
    if (shake) return;
    setDigits((prev) => prev.slice(0, -1));
  }, [shake]);

  // Keyboard support
  useEffect(() => {
    if (unlocked) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (e.key === "Backspace") handleBackspace();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [unlocked, handleDigit, handleBackspace]);

  // Still checking sessionStorage
  if (unlocked === null) return null;

  if (unlocked) return <>{children}</>;

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none">
      {/* App name */}
      <p className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-10">
        Tracker
      </p>

      <h1 className="text-xl font-semibold text-gray-800 mb-8">Enter PIN</h1>

      {/* Dot indicators */}
      <div
        className={`flex gap-5 mb-12 transition-transform ${
          shake ? "animate-shake" : ""
        }`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
              i < digits.length
                ? "bg-gray-800 border-gray-800"
                : "bg-transparent border-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-72">
        {keys.map((key, idx) => {
          if (key === "") {
            return <div key={idx} />;
          }
          return (
            <button
              key={idx}
              onClick={() =>
                key === "⌫" ? handleBackspace() : handleDigit(key)
              }
              className={`h-16 rounded-full text-xl font-medium transition-colors active:bg-gray-200 ${
                key === "⌫"
                  ? "text-gray-500 bg-transparent"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
