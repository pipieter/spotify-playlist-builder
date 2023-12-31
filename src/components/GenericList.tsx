import { FilterBox } from "./FilterBox";
import "./GenericList.css";
import { ReactNode, useEffect, useState } from "react";

export function GenericList<T>(props: {
  itemFunction: (entry: T, selectedEntry: T | undefined) => ReactNode;
  entries: T[];
  selectedEntry?: T | undefined;
  columnCount?: number;
  onClick?: (entry: T | undefined) => void;
  filterFunction?: (entry: T, query: string) => boolean;
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
        <FilterBox
          filterFunction={setFilter}
          refreshFunction={refreshFunction}
        />
      )}
      <div
        className={"list-item-holder"}
        style={{ gridTemplateColumns: gridColumnStyle }}
      >
        {filteredItems.map((entry) => (
          <div
            className={"h-fit"}
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
