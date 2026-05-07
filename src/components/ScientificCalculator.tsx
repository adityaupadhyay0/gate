"use client";

import { useState } from "react";
import { Calculator as CalcIcon, X } from "lucide-react";

export default function ScientificCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");

  const buttons = [
    "sin", "cos", "tan", "7", "8", "9", "/",
    "log", "ln", "sqrt", "4", "5", "6", "*",
    "pi", "e", "^", "1", "2", "3", "-",
    "(", ")", ".", "0", "C", "=", "+"
  ];

  const handlePress = (btn: string) => {
    if (btn === "C") setDisplay("0");
    else if (btn === "=") {
        try {
            // Replaced eval() with a safer Function constructor
            // and restricted character set check.
            const safeExpression = display.replace(/pi/g, Math.PI.toString())
                                .replace(/e/g, Math.E.toString())
                                .replace(/\^/g, "**")
                                .replace(/sin/g, "Math.sin")
                                .replace(/cos/g, "Math.cos")
                                .replace(/tan/g, "Math.tan")
                                .replace(/log/g, "Math.log10")
                                .replace(/ln/g, "Math.log")
                                .replace(/sqrt/g, "Math.sqrt");

            // Check for only allowed characters to prevent injection
            if (/[^0-9\+\-\*\/\.\(\) Math\.sin|cos|tan|log10|log|sqrt|E|PI]/.test(safeExpression)) {
                 throw new Error("Invalid characters");
            }

            const result = new Function(`return ${safeExpression}`)();
            setDisplay(Number(result).toString());
        } catch {
            setDisplay("Error");
        }
    }
    else {
        setDisplay(prev => prev === "0" ? (['sin','cos','tan','log','ln','sqrt'].includes(btn) ? btn + '(' : btn) : prev + (['sin','cos','tan','log','ln','sqrt'].includes(btn) ? btn + '(' : btn));
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <CalcIcon className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-10 w-80 glass-card p-6 z-[60] animate-in slide-in-from-bottom-5 duration-300">
           <div className="flex justify-between items-center mb-4">
              <span className="font-black text-xs uppercase tracking-widest text-slate-400">Scientific Calc</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900">
                 <X className="w-5 h-5" />
              </button>
           </div>

           <div className="bg-slate-900 p-4 rounded-xl mb-4 text-right overflow-hidden">
              <span className="text-2xl font-mono text-emerald-400 truncate block">{display}</span>
           </div>

           <div className="grid grid-cols-4 gap-2">
              {buttons.map(btn => (
                <button
                  key={btn}
                  onClick={() => handlePress(btn)}
                  className={`py-2 rounded-lg font-bold text-sm transition-all active:scale-90 ${
                    ['7','8','9','4','5','6','1','2','3','0','.'].includes(btn)
                    ? 'bg-white text-slate-900 border border-slate-100 hover:bg-slate-50'
                    : btn === "=" ? 'bg-brand-600 text-white col-span-1'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {btn}
                </button>
              ))}
           </div>
        </div>
      )}
    </>
  );
}
