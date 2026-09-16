// src/engine/storyEngine.js

/**
 * Quid Story Engine v1
 *
 * The engine knows HOW a situation works.
 * Scenario files know WHAT happens in a particular situation.
 *
 * Important:
 * - no fixed "3 actions"
 * - every action changes the world
 * - previous decisions affect later options
 * - scenarios end because of world state, not number of clicks
 */

export function createWorld(scenario) {
  return {
    scenarioId: scenario.id,

    ...structuredClone(scenario.startingState),

    flags: {
      ...(scenario.startingState.flags || {}),
    },

    actionHistory: [],
    eventHistory: [],

    status: "playing",
    ending: null,
  };
}

/**
 * Convert "18:04" + 45 minutes -> "18:49"
 */
export function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);

  const totalMinutes = hours * 60 + mins + minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, "0")}:${String(
    newMinutes
  ).padStart(2, "0")}`;
}

/**
 * Convert time into a number so conditions can compare times.
 * "20:15" -> 1215
 */
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Return only actions that are currently possible.
 */
export function getAvailableActions(world, scenario) {
  return scenario.actions.filter((action) => {
    if (!action.isAvailable) return true;

    return action.isAvailable(world);
  });
}

/**
 * Apply one player action to the world.
 */
export function performAction(world, scenario, actionId) {
  if (world.status !== "playing") {
    return world;
  }

  const action = scenario.actions.find((item) => item.id === actionId);

  if (!action) {
    console.error(`Quid Engine: action "${actionId}" does not exist.`);
    return world;
  }

  if (action.isAvailable && !action.isAvailable(world)) {
    console.warn(`Quid Engine: action "${actionId}" is not available.`);
    return world;
  }

  const before = structuredClone(world);

  let nextWorld = structuredClone(world);

  // Time passes.
  if (action.duration) {
    nextWorld.time = addMinutes(nextWorld.time, action.duration);
  }

  // Scenario-specific state changes.
  if (action.apply) {
    nextWorld = action.apply(nextWorld);
  }

  const historyEntry = {
    actionId: action.id,
    label: action.label,
    at: before.time,
    finishedAt: nextWorld.time,
    before,
  };

  nextWorld.actionHistory = [
    ...world.actionHistory,
    {
      ...historyEntry,
      after: null,
    },
  ];

  // Time/state changes may trigger events.
  nextWorld = resolveEvents(nextWorld, scenario);

  // The world itself decides whether the situation has naturally ended.
  nextWorld = resolveEnding(nextWorld, scenario);

  // Store final state produced by this decision.
  const history = [...nextWorld.actionHistory];
  const lastIndex = history.length - 1;

  if (lastIndex >= 0) {
    history[lastIndex] = {
      ...history[lastIndex],
      after: createHistorySnapshot(nextWorld),
    };
  }

  nextWorld.actionHistory = history;

  return nextWorld;
}

/**
 * Trigger events whose conditions have become true.
 *
 * Each event is triggered only once unless the scenario explicitly
 * implements repeatable behaviour later.
 */
export function resolveEvents(world, scenario) {
  let nextWorld = structuredClone(world);

  for (const event of scenario.events || []) {
    const alreadyTriggered = nextWorld.eventHistory.some(
      (entry) => entry.eventId === event.id
    );

    if (alreadyTriggered) continue;

    if (event.when(nextWorld)) {
      if (event.apply) {
        nextWorld = event.apply(nextWorld);
      }

      nextWorld.eventHistory = [
        ...nextWorld.eventHistory,
        {
          eventId: event.id,
          at: nextWorld.time,
        },
      ];
    }
  }

  return nextWorld;
}

/**
 * Check natural scenario endings.
 */
export function resolveEnding(world, scenario) {
  for (const ending of scenario.endings || []) {
    if (ending.when(world)) {
      return {
        ...world,
        status: "finished",
        ending: {
          id: ending.id,
          title: ending.title,
          message: ending.message,
        },
      };
    }
  }

  return world;
}

/**
 * Smaller snapshot for decision history.
 * We deliberately avoid recursively storing actionHistory inside itself.
 */
function createHistorySnapshot(world) {
  const {
    actionHistory,
    eventHistory,
    ...state
  } = world;

  return {
    ...structuredClone(state),
    eventHistory: structuredClone(eventHistory),
  };
}