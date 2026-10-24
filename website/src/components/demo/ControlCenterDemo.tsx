"use client";

// A walkthrough of Oriel Control Center on the demo page: connect a TV, review an operation with its exact
// commands, confirm, run, and see the result. It's a web recreation for one fictional TV; it doesn't run the
// desktop app's code or connect to anything (PRD section 7).

import { Check, Circle, Copy, Laptop, LoaderCircle, RotateCcw, TriangleAlert } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DEMO_TV, ccReducer, deviceReport, initialCcState, operationOptions, planFor, type CcState, type Plan } from "@/lib/demo/controlCenter";
import { cn } from "@/lib/utils";

type Dispatch = (action: Parameters<typeof ccReducer>[1]) => void;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:p-5">
      <h3 className="text-[1.0625rem] font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <p className="eyebrow">{title}</p>
      <div className="grid gap-1.5 text-callout text-fg-2">{children}</div>
    </div>
  );
}

function Commands({ lines }: { lines: string[] }) {
  return (
    <pre className="overflow-x-auto rounded-sm border border-border bg-background px-3 py-2.5 font-mono text-[13px] leading-relaxed text-fg">
      {lines.join("\n")}
    </pre>
  );
}

function Welcome() {
  return (
    <Section title="Connect a TV">
      <ol className="grid list-decimal gap-1.5 pl-5 text-callout text-fg-2">
        <li>On the TV, open Settings, then About, and select the build number seven times to turn on developer options.</li>
        <li>In Developer options, turn on USB debugging or network debugging.</li>
        <li>Enter the TV’s address on the left and select Connect, or plug in a USB cable.</li>
        <li>Accept the prompt on the TV, then choose the device from the list.</li>
      </ol>
      <p className="text-callout font-semibold">In this demo, select Connect on the left to continue.</p>
    </Section>
  );
}

function DeviceView({ state, dispatch }: { state: CcState; dispatch: Dispatch }) {
  const [copied, setCopied] = useState(false);
  const report = deviceReport(state.tv);
  const copy = () => {
    void navigator.clipboard?.writeText(report).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };
  const facts: [string, string][] = [
    ["Platform", DEMO_TV.platform],
    ["Android", `${DEMO_TV.android}, build ${DEMO_TV.build}`],
    ["Screen", DEMO_TV.screen],
    ["Memory", DEMO_TV.memory],
    ["Connection", `Network (${DEMO_TV.address})`],
    ["Home app", state.tv.orielIsHome ? "tv.oriel.launcher/.MainActivity" : "com.google.android.apps.tv.launcherx/.home.HomeActivity"],
    ["Oriel", state.tv.orielInstalled ? "Installed, version 0.1.0-dev" : "Not installed"],
  ];

  return (
    <>
      <Section title={DEMO_TV.label}>
        <dl className="grid gap-x-6 gap-y-1.5 text-callout sm:grid-cols-[8rem_1fr]">
          {facts.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-fg-2">{label}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="flex items-start gap-2 text-callout">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          This connection uses network debugging, which isn’t encrypted. Turn it off on the TV when you’re done.
        </p>
      </Section>

      <Section title="Operations">
        <ul className="grid divide-y divide-border">
          {operationOptions(state.tv).map((option) => (
            <li key={option.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{option.title}</p>
                {"reason" in option && <p className="text-callout text-fg-2">{option.reason}</p>}
              </div>
              {"plan" in option && (
                <Button size="sm" onClick={() => dispatch({ type: "review", id: option.id })}>
                  Review
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Device report">
        <p className="text-callout text-fg-2">
          A summary to share in a compatibility report or when asking for help. It leaves out the TV’s address, serial number, and list of
          apps.
        </p>
        <Commands lines={report.split("\n")} />
        <Button variant="quiet" size="sm" className="justify-self-start" onClick={copy}>
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          {copied ? "Copied" : "Copy report"}
        </Button>
      </Section>

      <Section title="History">
        {state.history.length === 0 ? (
          <p className="text-callout text-fg-2">No operations yet. History stays on your computer and leaves out serial numbers.</p>
        ) : (
          <ul className="grid gap-1 text-callout">
            {[...state.history].reverse().map((entry, index) => (
              <li key={`${entry.operation}-${state.history.length - index}`}>
                {DEMO_TV.label} · {entry.operation} · <span className="text-success">{entry.outcome}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function ReviewSheet({ plan, confirmed, dispatch }: { plan: Plan; confirmed: boolean; dispatch: Dispatch }) {
  return (
    <section className="grid gap-5 rounded-md border border-border bg-surface p-4 sm:p-6" aria-labelledby="cc-review-title">
      <div className="grid gap-1">
        <p className="eyebrow">Review before anything changes</p>
        <h3 id="cc-review-title" className="text-title3">
          {plan.title}
        </h3>
        <p className="text-callout text-fg-2">
          On {DEMO_TV.label} ({DEMO_TV.address})
        </p>
      </div>
      <Block title="What it does">
        {plan.explanation.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </Block>
      <Block title="Risks">
        <ul className="grid list-disc gap-1 pl-5">
          {plan.risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </Block>
      <Block title="Can it be undone?">
        <p>{plan.reversibility}</p>
      </Block>
      <Block title="Exact commands">
        <Commands lines={plan.commands} />
      </Block>
      <Block title="If something goes wrong">
        {plan.recovery.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </Block>
      <label className="flex cursor-pointer items-start gap-3 text-callout">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => dispatch({ type: "confirm", value: event.target.checked })}
          className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-accent"
        />
        <span>I’ve read this and want to run it on {DEMO_TV.label}.</span>
      </label>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => dispatch({ type: "run" })} disabled={!confirmed}>
          Run
        </Button>
        <Button variant="quiet" onClick={() => dispatch({ type: "cancel" })}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function Progress({ plan, completed, reduceMotion }: { plan: Plan; completed: number; reduceMotion: boolean }) {
  return (
    <Section title={`Running: ${plan.title}`}>
      <ul className="grid gap-2">
        {plan.commands.map((command, index) => {
          const status = index < completed ? "done" : index === completed ? "running" : "waiting";
          return (
            <li key={command} className="flex items-start gap-2.5 text-callout">
              {status === "done" ? (
                <Check aria-label="Done" className="mt-0.5 size-4 shrink-0 text-success" />
              ) : status === "running" ? (
                <LoaderCircle aria-label="Running" className={cn("mt-0.5 size-4 shrink-0 text-accent", !reduceMotion && "animate-spin")} />
              ) : (
                <Circle aria-label="Waiting" className="mt-0.5 size-4 shrink-0 text-fg-3" />
              )}
              <code className="font-mono text-[13px] break-all">{command}</code>
            </li>
          );
        })}
      </ul>
      <p className="text-callout text-fg-2">Steps run one at a time, and nothing runs after a step fails.</p>
    </Section>
  );
}

function Result({ result, dispatch }: { result: NonNullable<CcState["result"]>; dispatch: Dispatch }) {
  return (
    <Section title={`${result.title} succeeded`}>
      <p className="text-callout text-fg-2">Every step finished. Control Center read the TV again, so the details below are current.</p>
      <Commands lines={result.commands} />
      <Button size="sm" className="justify-self-start" onClick={() => dispatch({ type: "closeResult" })}>
        Back to the TV
      </Button>
    </Section>
  );
}

export function ControlCenterDemo() {
  const [state, dispatch] = useReducer(ccReducer, undefined, initialCcState);
  const reduceMotion = useReducedMotion() ?? false;
  const plan = state.review ? planFor(state.tv, state.review) : null;

  useEffect(() => {
    if (!state.running) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), reduceMotion ? 300 : 1300);
    return () => window.clearTimeout(timer);
  }, [state.running, reduceMotion]);

  let main: ReactNode;
  if (!state.connected) main = <Welcome />;
  else if (!state.selected) main = <p className="text-callout text-fg-2">Connected. Choose {DEMO_TV.label} in the device list.</p>;
  else if (state.running && plan) main = <Progress plan={plan} completed={state.running.completed} reduceMotion={reduceMotion} />;
  else if (plan) main = <ReviewSheet plan={plan} confirmed={state.confirmed} dispatch={dispatch} />;
  else
    main = (
      <>
        {state.result && <Result result={state.result} dispatch={dispatch} />}
        <DeviceView state={state} dispatch={dispatch} />
      </>
    );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-raised shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface px-4 py-2.5">
        <Laptop aria-hidden="true" className="size-4.5 text-fg-2" />
        <span className="text-callout font-semibold">Oriel Control Center</span>
        <span className="text-caption text-fg-2">Simulated. Nothing connects to a real TV.</span>
        <Button variant="ghost" size="sm" className="ml-auto min-h-8 px-3" onClick={() => dispatch({ type: "reset" })}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Start over
        </Button>
      </div>
      <div className="grid md:grid-cols-[17rem_1fr]">
        <aside className="grid content-start gap-3 border-b border-border p-5 md:border-r md:border-b-0" aria-label="Devices">
          <p className="eyebrow">Devices</p>
          {state.connected ? (
            <button
              type="button"
              aria-pressed={state.selected}
              onClick={() => dispatch({ type: "select" })}
              className={cn(
                "grid cursor-pointer gap-0.5 rounded-sm border p-3 text-left",
                state.selected ? "border-accent bg-accent/10" : "border-border hover:bg-surface-hover",
              )}
            >
              <span className="font-semibold">{DEMO_TV.label}</span>
              <span className="text-caption text-fg-2">{DEMO_TV.address} · ready · network</span>
            </button>
          ) : (
            <p className="text-callout text-fg-2">No devices yet. Connect over the network below.</p>
          )}
          <label className="grid gap-1.5 text-caption font-semibold text-fg-2">
            TV address
            <input
              readOnly
              value={DEMO_TV.address.split(":")[0]}
              className="min-h-10 rounded-sm border border-border bg-background px-3 font-mono text-callout font-normal text-fg"
            />
          </label>
          <Button size="sm" onClick={() => dispatch({ type: "connect" })} disabled={state.connected}>
            {state.connected ? "Connected" : "Connect"}
          </Button>
          <p className="text-caption text-fg-2">Network debugging isn’t encrypted. Turn it off on the TV when you’re done.</p>
        </aside>
        <div className="grid content-start gap-5 p-5 sm:p-6">{main}</div>
      </div>
    </div>
  );
}
