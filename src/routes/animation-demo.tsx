import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export const Route = createFileRoute("/animation-demo")({
  component: RouteComponent,
});

function RouteComponent() {
  const [animatedCountDown, setAnimatedCountDown] = useState(10);
  const [inputCountDown, setInputCountDown] = useState(animatedCountDown);
  const store = useRef<number>(animatedCountDown);
  const animationFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateCountDown = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    const elapsed = timestamp - startTimeRef.current;
    const seconds = Math.floor(elapsed / 1000);
    const remaining = Math.max(0, store.current - seconds);
    
    setAnimatedCountDown((prev) => {
      if (prev === remaining) {
        return prev;
      }
      return remaining;
    });

    if (remaining <= 0) {
      stopAnimation();
    } else {
      console.log("remaining", remaining);
      animationFrameIdRef.current = requestAnimationFrame(animateCountDown);
    }
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    animationFrameIdRef.current = requestAnimationFrame(animateCountDown);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    cancelAnimation();
  }, []);

  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center justify-center bg-slate-100 p-4 rounded shadow-lg gap-2">
        <div className="flex gap-2">
          <button
            onClick={startAnimation}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Animate
          </button>
          <button
            onClick={stopAnimation}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop
          </button>
        </div>
        <div className="text-2xl font-bold">{animatedCountDown}</div>
        <div className="">
          <LoaderCircleIcon className={isAnimating ? "animate-spin" : ""} />
        </div>

        <div className="flex gap-2">
          <label htmlFor="store">Store</label>
          <input
            type="number"
            value={inputCountDown}
            onChange={(e) => setInputCountDown(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            className=""
            onClick={() => {
              store.current = inputCountDown;
              setAnimatedCountDown(inputCountDown);
            }}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
