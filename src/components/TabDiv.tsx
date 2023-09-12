import React, { Children, ReactNode, useState } from "react";

import "./TabDiv.css";

export function TabDiv(props: {
  names: string[];
  children: ReactNode;
  className?: string;
}) {
  const { names, children, className } = props;
  const [index, setIndex] = useState(0);

  const arrayChildren = Children.toArray(children);

  return (
    <div className={className}>
      {/* Tab selectors */}
      <div className={"flex-evenly"}>
        {names.map((name, i) => (
          <div
            onClick={() => setIndex(i)}
            className={`flex-center tab-div-name ${i === index && "enabled"}`}
          >
            {name}
          </div>
        ))}
      </div>
      {/* Tab divs */}
      <div className={"w-100 h-100"}>
        {arrayChildren.map((child, i) => (
          <div className={`h-100 ${index === i ? "block" : "hide"}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
