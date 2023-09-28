import { ReactNode } from "react";
import "./Tooltip.css";
export function Tooltip(props: {
  text: [string, string][];
  children: ReactNode;
}) {
  const { text, children } = props;

  return (
    <div className={"tooltip w-100"}>
      <div>{children}</div>
      <span className={"tooltiptext"}>
        {text.map(([title, text]) => (
          <p>
            <b>{title}: </b>
            {text}
          </p>
        ))}
      </span>
    </div>
  );
}
