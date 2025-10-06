interface BubbleTextProps {
  text: string
  className?: string
}

export function BubbleText({ text, className = "" }: BubbleTextProps) {
  return (
    <h2 className={`text-center text-5xl font-thin text-indigo-300 ${className}`}>
      {text.split("").map((char, idx) => (
        <span className="bubble-text-char" key={idx}>
          {char}
        </span>
      ))}
    </h2>
  )
}
