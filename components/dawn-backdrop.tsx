// The sky behind every page: CSS only (app/globals.css, "Dawn"), so it costs no script and stills under reduced motion.
export function DawnBackdrop() {
  return (
    <div className="dawn" aria-hidden>
      <div className="dawn-stars" />
      <div className="dawn-haze" />
      <div className="dawn-rise">
        <div className="dawn-rays" />
        <div className="dawn-sun" />
      </div>
      <div className="dawn-land" />
      <div className="dawn-horizon" />
      <div className="dawn-grain" />
    </div>
  );
}
