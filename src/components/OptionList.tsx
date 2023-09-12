import { SpotifyOption, SpotifyOptionSliderType } from "../data/SpotifyOption";

import "./OptionList.css";

function SpotifyOptionInput(props: {
  option: SpotifyOption;
  setValue: (option: SpotifyOption, value: string) => void;
}) {
  const { option, setValue } = props;
  if (option.type instanceof SpotifyOptionSliderType) {
    return (
      <>
        <td className={"w-100"}>
          <input
            className={"slider w-100"}
            type={"range"}
            min={option.type.min}
            max={option.type.max}
            step={option.type.step}
            value={option.value}
            onChange={(e) => setValue(option, e.target.value)}
            disabled={!option.enabled}
          />
        </td>
        <td className={"flex-end w-150px"}>
          {(Math.round(option.value * 100) / 100).toFixed(2)}
        </td>
      </>
    );
  } else {
    return (
      <td colSpan={2} className={"w-100"}>
        <select
          defaultValue={option.value}
          onChange={(e) => setValue(option, e.target.value)}
          className={"button-dark font-smaller w-100"}
          disabled={!option.enabled}
        >
          {option.type.options.map((option) => (
            <option value={option.value}>{option.name}</option>
          ))}
        </select>
      </td>
    );
  }
}

function SpotifyOptionElement(props: {
  option: SpotifyOption;
  onHover: (option: SpotifyOption | undefined) => void;
  toggleOptions: (option: SpotifyOption[], checked: boolean) => void;
  setValue: (option: SpotifyOption, value: string) => void;
}) {
  const { option, onHover, toggleOptions, setValue } = props;

  return (
    <tr
      className={`flex-left-center ${option.enabled ? "" : "disabled"}`}
      onMouseEnter={() => onHover(option)}
      onMouseLeave={() => onHover(undefined)}
    >
      <td>
        <input
          type={"checkbox"}
          className={"checkbox margin-8"}
          checked={option.enabled}
          onChange={(e) => {
            toggleOptions([option], e.target.checked);
          }}
        />
      </td>
      <td>
        <p
          onClick={() => {
            toggleOptions([option], !option.enabled);
          }}
          className={"w-150px pointer"}
        >
          {option.display_name}
        </p>
      </td>
      <SpotifyOptionInput option={option} setValue={setValue} />
    </tr>
  );
}

export function OptionList(props: {
  options: SpotifyOption[];
  onHover: (option: SpotifyOption | undefined) => void;
  toggleOptions: (options: SpotifyOption[], checked: boolean) => void;
  setValue: (option: SpotifyOption, value: string) => void;
  resetOptions: (options: SpotifyOption[]) => void;
}) {
  const { options, onHover, toggleOptions, setValue, resetOptions } = props;
  return (
    <div className={"flex-col flex-center-around"}>
      <table className={"w-80 margin-8"}>
        <tbody>
          {options.map((option) => (
            <SpotifyOptionElement
              option={option}
              setValue={setValue}
              onHover={onHover}
              toggleOptions={toggleOptions}
            />
          ))}
        </tbody>
      </table>
      <div className={"flex-evenly w-100"}>
        <button
          className={"button-dark w-120px font-small"}
          onClick={() => toggleOptions(options, false)}
        >
          Select none
        </button>
        <button
          className={"button-dark w-120px font-small"}
          onClick={() => toggleOptions(options, true)}
        >
          Select all
        </button>
        <button
          className={"button-dark w-120px font-small"}
          onClick={() => resetOptions(options)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
