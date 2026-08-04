// The single shared "active milestone" model (ADR-011: DOM events over
// React Context for this cross-component coordination). Timeline hover,
// timeline keyboard focus, mobile scroll, and graph hover are all just
// inputs that call `setActiveMilestone`; TimelineActivator and JourneyCanvas
// each render from `onActiveMilestone` alone, regardless of which input
// last wrote the value. Neither owns the state — this module is the only
// source of truth, and dispatch only ever happens in response to a genuine
// local input (never from inside an `onActiveMilestone` handler), which is
// what keeps the two listeners from feeding back into each other.
const ACTIVE_MILESTONE_EVENT = "journey:active";

interface ActiveMilestoneDetail {
  index: number | null;
}

export function setActiveMilestone(index: number | null) {
  document.dispatchEvent(
    new CustomEvent<ActiveMilestoneDetail>(ACTIVE_MILESTONE_EVENT, {
      detail: { index },
    }),
  );
}

export function onActiveMilestone(
  handler: (index: number | null) => void,
): () => void {
  function listener(event: Event) {
    const detail = (event as CustomEvent<ActiveMilestoneDetail>).detail;
    handler(detail?.index ?? null);
  }
  document.addEventListener(ACTIVE_MILESTONE_EVENT, listener);
  return () => document.removeEventListener(ACTIVE_MILESTONE_EVENT, listener);
}
