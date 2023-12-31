import "./FilterBox.css";

export function FilterBox(props: {
  filterFunction: (query: string) => void;
  refreshFunction?: () => void;
}) {
  return (
    <div className="input-div">
      <input
        className="input-text"
        type={"text"}
        placeholder={"Search..."}
        onChange={(e) => props.filterFunction(e.target.value)}
      />
      {props.refreshFunction && (
        <p className={"input-refresh"} onClick={props.refreshFunction}>
          ⟳
        </p>
      )}
    </div>
  );
}
