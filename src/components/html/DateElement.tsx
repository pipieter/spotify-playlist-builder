export function DateElement(props: {
  date: Date;
  onChange: (date: Date) => void;
}) {
  let date = props.date;
  if (isNaN(date.getTime())) {
    date = new Date();
  }

  return (
    <input
      className="button-dark"
      type="date"
      value={date.toISOString().split("T")[0]}
      onChange={(e) => {
        const dateStr = e.target.value as string;
        try {
          const date = new Date(dateStr);
          props.onChange(date);
        } catch {
          props.onChange(new Date());
        }
      }}
    />
  );
}
