export enum STATUS {
  SingleLine = 'single_line',
  MultiLine = 'multi_line',
  Checkbox = 'checkbox',
  Select = 'select',
  Date = 'date',
  Number = 'number',
  User = 'user',
}

export const DEFAULT_NUM_ROWS = 3;

export const DEFAULT_COLS = [
  {
    name: "Name",
    type: STATUS.SingleLine,
    primary: true,
  },
  {
    name: "Notes",
    type: STATUS.MultiLine,
  },
  {
    name: "Assignee",
    type: STATUS.User,
  },
  {
    name: "Status",
    type: STATUS.Select,
  },
];
