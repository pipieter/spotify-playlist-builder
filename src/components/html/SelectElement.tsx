import "./SelectElement.css";

export function SelectElement<T>(props: {
  value: T;
  options: Array<T>;
  onChange: (t: T) => void;
}) {
  return (
    <select
    className="button-dark"
      value={props.value as string}
      onChange={(e) => props.onChange(e.target.value as T)}
    >
      {props.options.map((o) => (
        <option value={o as string}>{o as string}</option>
      ))}
    </select>
  );
}
