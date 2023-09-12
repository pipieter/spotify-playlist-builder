import "./GenericList.css";
import { ReactNode, useEffect, useState } from "react";

export function GenericList<T>(props: {
  itemFunction: (entry: T, selectedEntry: T | undefined) => ReactNode;
  filterFunction?: (entry: T, query: string) => boolean;
  entries: T[];
  selectedEntry: T | undefined;
  onClick?: (entry: T | undefined) => void;
  columnCount: number;
  refreshFunction?: () => void;
}) {
  const {
    entries,
    selectedEntry,
    onClick,
    filterFunction,
    itemFunction,
    refreshFunction,
  } = props;
  const columnCount = props.columnCount ? props.columnCount : 1;

  const [filter, setFilter] = useState("");
  const [filteredItems, setFilteredItems] = useState<typeof entries>([]);

  useEffect(() => {
    const items = entries.filter((entry) =>
      filterFunction ? filterFunction(entry, filter) : true
    );
    setFilteredItems(items);
  }, [entries, filter, filterFunction]);

  const gridColumnStyle = `repeat(${columnCount}, 1fr)`;

  return (
    <div className="list-list">
      {filterFunction && (
        <div className="list-input-div">
          <input
            className="input-text"
            type={"text"}
            placeholder={"Search..."}
            onChange={(e) => setFilter(e.target.value)}
          />
          {refreshFunction && (
            <p className={"list-input-refresh"} onClick={refreshFunction}>
              ⟳
            </p>
          )}
        </div>
      )}
      <div
        className={"list-item-holder"}
        style={{ gridTemplateColumns: gridColumnStyle }}
      >
        {filteredItems.map((entry) => (
          <div className={"h-fit"}
            onClick={() => {
              if (onClick) {
                if (entry === selectedEntry) {
                  onClick(undefined);
                } else {
                  onClick(entry);
                }
              }
            }}
          >
            {itemFunction(entry, selectedEntry)}
          </div>
        ))}
      </div>
    </div>
  );
}
