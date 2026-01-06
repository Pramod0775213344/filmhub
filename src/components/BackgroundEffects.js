"use client";

import dynamic from "next/dynamic";
import SpotlightEffect from "./SpotlightEffect";

const CinematicBackground = dynamic(() => import("./CinematicBackground"), {
  ssr: false,
});

export default function BackgroundEffects() {
  return (
    <>
      <CinematicBackground />
      <SpotlightEffect />
    </>
  );
}
