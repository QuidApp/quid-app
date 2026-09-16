// src/scenarios/sunday-basic.js

import { timeToMinutes } from "../engine/storyEngine";

/*
 * QUID — Scenario 001
 * Age: 11–12
 * Difficulty: Easy
 * Skill: Planning
 *
 * THE WEEK IN FRONT OF YOU
 *
 * This file describes the situation.
 * storyEngine.js decides how the world runs.
 */

export const sundayBasicScenario = {
  id: "11_12_EASY_PLANNING_01",

  title: "Sunday Evening",
  subtitle: "The week starts before Monday does.",

  ageStage: "11-12",
  difficulty: "easy",

  skills: ["planning"],

  // --------------------------------------------------
  // STARTING WORLD
  // --------------------------------------------------

  startingState: {
    day: "Sunday",
    time: "18:04",
    energy: 72,

    tasks: {
      essay: {
        name: "English Essay",
        progress: 0,
        due: "Monday",
      },

      maths: {
        name: "Maths Homework",
        progress: 50,
        due: "Monday",
      },
    },

    social: {
      alex: {
        planTime: "20:00",
        status: "waiting",
      },
    },

    entertainment: {
      episode: {
        releaseTime: "21:00",
        watched: false,
      },
    },

    flags: {
      alexMessaged: false,
      alexAnswered: false,
      alexDeclined: false,
      episodeAvailable: false,
      episodeMissed: false,
      bedtimeWarning: false,
    },

    messages: [],
  },

  // --------------------------------------------------
  // PLAYER ACTIONS
  // --------------------------------------------------

  actions: [
    {
      id: "work_essay",

      label: "Work on English essay",

      description:
        "Make a proper start on the essay that's due tomorrow.",

      duration: 45,

      isAvailable: (world) =>
        world.tasks.essay.progress < 100 &&
        timeToMinutes(world.time) < 22 * 60 + 30,

      apply: (world) => {
        const progress = Math.min(
          100,
          world.tasks.essay.progress + 45
        );

        return {
          ...world,

          energy: Math.max(0, world.energy - 10),

          tasks: {
            ...world.tasks,

            essay: {
              ...world.tasks.essay,
              progress,
            },
          },

          messages: [
            ...world.messages,
            progress === 100
              ? "English essay finished."
              : "You made progress on the English essay.",
          ],
        };
      },
    },

    {
      id: "finish_maths",

      label: "Finish maths homework",

      description:
        "Finish the maths homework that's already half done.",

      duration: 30,

      isAvailable: (world) =>
        world.tasks.maths.progress < 100 &&
        timeToMinutes(world.time) < 22 * 60 + 30,

      apply: (world) => ({
        ...world,

        energy: Math.max(0, world.energy - 6),

        tasks: {
          ...world.tasks,

          maths: {
            ...world.tasks.maths,
            progress: 100,
          },
        },

        messages: [
          ...world.messages,
          "Maths homework finished.",
        ],
      }),
    },

    {
      id: "take_break",

      label: "Take a short break",

      description:
        "Put everything down for a bit and recharge.",

      duration: 20,

      isAvailable: (world) =>
        timeToMinutes(world.time) < 22 * 60 + 15,

      apply: (world) => ({
        ...world,

        energy: Math.min(100, world.energy + 8),

        messages: [
          ...world.messages,
          "You took a short break.",
        ],
      }),
    },

    {
      id: "message_alex_early",

      label: "Message Alex about 8pm",

      description:
        "Check whether the call still works before 8pm arrives.",

      duration: 5,

      isAvailable: (world) =>
        !world.flags.alexMessaged &&
        !world.flags.alexAnswered &&
        !world.flags.alexDeclined &&
        timeToMinutes(world.time) < 20 * 60,

      apply: (world) => ({
        ...world,

        flags: {
          ...world.flags,
          alexMessaged: true,
        },

        social: {
          ...world.social,

          alex: {
            ...world.social.alex,
            status: "confirmed",
          },
        },

        messages: [
          ...world.messages,
          "Alex says 8pm still works.",
        ],
      }),
    },

    {
      id: "call_alex",

      label: "Call Alex",

      description:
        "Take the call you planned with Alex.",

      duration: 35,

      isAvailable: (world) => {
        const time = timeToMinutes(world.time);

        return (
          !world.flags.alexAnswered &&
          !world.flags.alexDeclined &&
          time >= 20 * 60 &&
          time < 21 * 60 + 15
        );
      },

      apply: (world) => ({
        ...world,

        energy: Math.max(0, world.energy - 4),

        flags: {
          ...world.flags,
          alexAnswered: true,
        },

        social: {
          ...world.social,

          alex: {
            ...world.social.alex,
            status: "done",
          },
        },

        messages: [
          ...world.messages,
          "You had your call with Alex.",
        ],
      }),
    },

    {
      id: "tell_alex_cant_call",

      label: "Tell Alex you can't call tonight",

      description:
        "Let Alex know instead of leaving them waiting.",

      duration: 5,

      isAvailable: (world) => {
        const time = timeToMinutes(world.time);

        return (
          !world.flags.alexAnswered &&
          !world.flags.alexDeclined &&
          time >= 19 * 60 + 30
        );
      },

      apply: (world) => ({
        ...world,

        flags: {
          ...world.flags,
          alexDeclined: true,
        },

        social: {
          ...world.social,

          alex: {
            ...world.social.alex,
            status: "cancelled",
          },
        },

        messages: [
          ...world.messages,
          "You told Alex you can't call tonight.",
        ],
      }),
    },

    {
      id: "watch_episode",

      label: "Watch the new episode",

      description:
        "Watch the episode you've been waiting for all day.",

      duration: 50,

      isAvailable: (world) =>
        world.flags.episodeAvailable &&
        !world.entertainment.episode.watched &&
        timeToMinutes(world.time) < 22 * 60 + 15,

      apply: (world) => ({
        ...world,

        energy: Math.min(100, world.energy + 5),

        entertainment: {
          ...world.entertainment,

          episode: {
            ...world.entertainment.episode,
            watched: true,
          },
        },

        messages: [
          ...world.messages,
          "You watched the new episode.",
        ],
      }),
    },

    {
      id: "go_to_bed",

      label: "Go to bed",

      description:
        "End Sunday here and deal with whatever is left tomorrow.",

      duration: 0,

      isAvailable: (world) =>
        timeToMinutes(world.time) >= 20 * 60 + 30,

      apply: (world) => ({
        ...world,

        flags: {
          ...world.flags,
          choseBed: true,
        },

        messages: [
          ...world.messages,
          "You decided to end the evening and go to bed.",
        ],
      }),
    },
  ],

  // --------------------------------------------------
  // EVENTS
  // Events happen because the world changed.
  // They are NOT choices.
  // --------------------------------------------------

  events: [
    {
      id: "alex_8pm",

      when: (world) =>
        timeToMinutes(world.time) >= 20 * 60 &&
        !world.flags.alexAnswered &&
        !world.flags.alexDeclined,

      apply: (world) => ({
        ...world,

        messages: [
          ...world.messages,
          world.flags.alexMessaged
            ? "It's 8pm. Alex is ready for the call you confirmed."
            : "It's after 8pm. Alex messages: 'Still calling?'",
        ],
      }),
    },

    {
      id: "episode_released",

      when: (world) =>
        timeToMinutes(world.time) >= 21 * 60,

      apply: (world) => ({
        ...world,

        flags: {
          ...world.flags,
          episodeAvailable: true,
        },

        messages: [
          ...world.messages,
          "The new episode is available now.",
        ],
      }),
    },

    {
      id: "bedtime_warning",

      when: (world) =>
        timeToMinutes(world.time) >= 22 * 60,

      apply: (world) => ({
        ...world,

        flags: {
          ...world.flags,
          bedtimeWarning: true,
        },

        messages: [
          ...world.messages,
          "It's getting late. Tomorrow is a school day.",
        ],
      }),
    },
  ],

  // --------------------------------------------------
  // NATURAL ENDINGS
  // No red X. No "wrong answer".
  // The evening simply reaches a natural outcome.
  // --------------------------------------------------

  endings: [
    {
      id: "player_chose_bed",

      title: "Sunday is over",

      message:
        "Tomorrow has arrived with the choices you made tonight.",

      when: (world) => world.flags.choseBed === true,
    },

    {
      id: "everything_resolved",

      title: "You're ready for Monday",

      message:
        "You've dealt with everything that needed your attention tonight.",

      when: (world) =>
        world.tasks.essay.progress === 100 &&
        world.tasks.maths.progress === 100 &&
        (world.flags.alexAnswered ||
          world.flags.alexDeclined) &&
        timeToMinutes(world.time) >= 21 * 60,
    },

    {
      id: "too_late",

      title: "Sunday got away from you",

      message:
        "It's late. Whatever is unfinished will still be there tomorrow.",

      when: (world) =>
        timeToMinutes(world.time) >= 23 * 60,
    },
  ],

  // --------------------------------------------------
  // LEARNING — NOT A SCORE
  // --------------------------------------------------

  learning: {
    primarySkill: "planning",

    evidence: [
      "noticed_deadlines",
      "considered_time",
      "managed_competing_commitments",
      "communicated_about_a_plan",
      "adapted_when_time_changed",
      "protected_rest",
    ],

    discoveryMessage: {
      title: "Planning",
      level: "DISCOVERED",

      quid:
        "Planning isn't about making the perfect schedule. It's about seeing what's coming early enough to make choices.",
    },
  },

  // --------------------------------------------------
  // OPTIONAL KNOWLEDGE
  // --------------------------------------------------

  dataCentreHooks: [
    {
      id: "planning_basics",
      title: "Why does planning help?",
    },

    {
      id: "time_estimation",
      title: "Why do things always take longer than we think?",
    },
  ],

  // --------------------------------------------------
  // JOURNEY PERSISTENCE
  // --------------------------------------------------

  persistence: {
    keep: [
      "learning.planning",
      "decisionPath",
    ],

    discard: [
      "Sunday homework",
      "Sunday clock",
      "episode state",
    ],
  },
};