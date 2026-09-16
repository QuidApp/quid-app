import { useState } from "react";
import {
  createWorld,
  getAvailableActions,
  performAction,
} from "./engine/storyEngine";

import { sundayBasicScenario } from "./scenarios/sunday-basic";

function App() {
  const [world, setWorld] = useState(() =>
    createWorld(sundayBasicScenario)
  );

  const availableActions = getAvailableActions(
    world,
    sundayBasicScenario
  );

  function handleAction(actionId) {
    setWorld((currentWorld) =>
      performAction(
        currentWorld,
        sundayBasicScenario,
        actionId
      )
    );
  }

  function restartScenario() {
    setWorld(createWorld(sundayBasicScenario));
  }

  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>Quid</h1>

      <h2>{sundayBasicScenario.title}</h2>

      <p>
        <strong>Time:</strong> {world.time}
      </p>

      <p>
        <strong>Energy:</strong> {world.energy}
      </p>

      <hr />

      <h3>Current world</h3>

      <pre
        style={{
          background: "#111827",
          color: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(world, null, 2)}
      </pre>

      {world.status === "playing" ? (
        <>
          <h3>What do you do?</h3>

          {availableActions.length === 0 ? (
            <p>No actions are currently available.</p>
          ) : (
            availableActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                style={{
                  display: "block",
                  marginBottom: "10px",
                  padding: "12px 18px",
                  cursor: "pointer",
                }}
              >
                {action.label}
              </button>
            ))
          )}
        </>
      ) : (
        <>
          <h3>Situation finished</h3>

          {world.ending && (
            <>
              <h4>{world.ending.title}</h4>
              <p>{world.ending.message}</p>
            </>
          )}

          <button
            onClick={restartScenario}
            style={{
              padding: "12px 18px",
              cursor: "pointer",
            }}
          >
            Restart scenario
          </button>
        </>
      )}

      <hr />

      <h3>Decision path</h3>

      {world.actionHistory.length === 0 ? (
        <p>No decisions yet.</p>
      ) : (
        <ol>
          {world.actionHistory.map((entry, index) => (
            <li key={`${entry.actionId}-${index}`}>
              {entry.at} → {entry.finishedAt}: {entry.label}
            </li>
          ))}
        </ol>
      )}

      <h3>Events</h3>

      {world.eventHistory.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {world.eventHistory.map((event, index) => (
            <li key={`${event.eventId}-${index}`}>
              {event.at}: {event.eventId}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;