"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { Milestone } from "@/lib/content/journey";

interface JourneyCanvasLoaderProps {
  milestones: Milestone[];
}

const JourneyCanvas = dynamic(
  () => import("./journey-canvas").then((mod) => mod.JourneyCanvas),
  { ssr: false },
);

// No live subscription: the capability check is deliberately one-shot (see
// below), so the subscribe callback is never invoked and the snapshot is
// read exactly once, on the client's first render after hydration.
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return (
    window.matchMedia("(min-width: 768px)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

// Not named in 03-roadmap.md's file list, but required by its own
// architectural decision: "JourneyCanvas is loaded via a dynamic import
// gated on a client-side capability check." A capability check needs
// window/matchMedia, which only exists in a Client Component, and
// next/dynamic's ssr:false option is only valid from one — so the gate
// can't live inside the server-rendered Journey component itself.
//
// useSyncExternalStore rather than useEffect+setState: the server has no
// window, so the server-rendered (and initial client hydration) value must
// be a fixed false — exactly what getServerSnapshot provides, avoiding a
// hydration mismatch. The check still only ever runs once per mount: the
// 768px breakpoint matches Header's own md breakpoint and MilestoneList's
// CSS media condition, so the two can never disagree about which one is
// the visible content for a given visitor, and deciding whether to fetch a
// JS chunk at all shouldn't re-fire as someone resizes their window
// mid-session.
export function JourneyCanvasLoader({ milestones }: JourneyCanvasLoaderProps) {
  const capable = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!capable) return null;
  return <JourneyCanvas milestones={milestones} />;
}
