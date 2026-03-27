interface Props { cols?: number; rows?: number }

export default function LoadingRows({ cols = 6, rows = 8 }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-zinc-800/50 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
