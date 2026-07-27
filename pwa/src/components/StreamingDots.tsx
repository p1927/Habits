interface StreamingDotsProps {
  label?: string;
}

export function StreamingDots({ label = 'Coach is typing' }: StreamingDotsProps) {
  return (
    <div className="chat-streaming-dots" role="status" aria-label={label}>
      <span className="chat-streaming-dots__bubble">
        <span className="chat-streaming-dots__dot" />
        <span className="chat-streaming-dots__dot" />
        <span className="chat-streaming-dots__dot" />
      </span>
    </div>
  );
}
