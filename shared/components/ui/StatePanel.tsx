"use client";

interface StatePanelProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StatePanel({
  title,
  message,
  actionLabel,
  onAction,
}: StatePanelProps) {
  return (
    <div className="state-panel" role="status">
      <p className="state-panel-title">{title}</p>
      <p className="state-panel-message">{message}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="state-panel-action">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
