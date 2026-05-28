import Button from "../../components/ui/Button";

export default function AssistantPanel() {
  return (
    <div className="kawaify-card p-5">
      <h2 className="text-lg font-semibold text-[var(--text)]">AI assistant coming soon</h2>
      <p className="text-sm kawaify-text-muted mt-1">
        Will help search music, create playlists and explain moods.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          disabled
          value="Ask Kawaify AI..."
          className="kawaify-input h-11 px-3 flex-1 text-sm opacity-75 cursor-not-allowed"
          aria-label="Assistant prompt input placeholder"
          readOnly
        />
        <Button type="button" variant="secondary" size="md" disabled>
          Ask Kawaify AI
        </Button>
      </div>
    </div>
  );
}
