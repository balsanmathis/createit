"use client";
import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleColor?: string;
  particleDensity?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
};

export function SparklesCore({
  id,
  className,
  background = "transparent",
  particleColor = "#ffffff",
  particleDensity = 40,
  speed = 0.5,
  minSize = 0.6,
  maxSize = 1.4,
}: SparklesProps) {
  const [init, setInit] = useState(false);
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container) => {
    // no-op
  };

  return (
    <AnimatePresence>
      {init && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("h-full w-full", className)}
        >
          <Particles
            id={id ?? generatedId}
            className="h-full w-full"
            particlesLoaded={particlesLoaded}
            options={{
              background: { color: { value: background } },
              fullScreen: { enable: false, zIndex: 1 },
              fpsLimit: 60,
              particles: {
                color: { value: particleColor },
                move: {
                  enable: true,
                  speed: speed,
                  direction: "none",
                  random: true,
                  straight: false,
                  outModes: { default: "out" },
                },
                number: {
                  value: particleDensity,
                  density: { enable: true },
                },
                opacity: {
                  value: { min: 0.1, max: 0.6 },
                  animation: {
                    enable: true,
                    speed: 0.8,
                    sync: false,
                  },
                },
                shape: { type: "circle" },
                size: {
                  value: { min: minSize, max: maxSize },
                },
              },
              detectRetina: true,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
