"use client";

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export default function LoadingDots({ className = "", dotClassName = "w-1.5 h-1.5 rounded-full bg-orange-400" }: LoadingDotsProps) {
  return (
    <span className={`inline-flex gap-1 ${className}`}>
      <span className={`${dotClassName} animate-bounce [animation-delay:0ms]`} />
      <span className={`${dotClassName} animate-bounce [animation-delay:150ms]`} />
      <span className={`${dotClassName} animate-bounce [animation-delay:300ms]`} />
    </span>
  );
}
