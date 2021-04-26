import { elt } from "./util";
import dayjs from 'dayjs'
//header
const header = elt(
  "h1",
  { style: "margin-top:0;margin-left:1rem" },
  "Mjerenja na vodoopskrbnoj mreži"
);
document.body.appendChild(header);
//start&end datetime
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt(
  "select",
  {},
  elt("option", { value: "177" }, "Korčula 1")
);
startDate.value = dayjs().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = dayjs().format("YYYY-MM-DDTHH:mm");
//form
const fielset = elt(
    "fieldset",
    { style: "margin-left:1em" },
    elt("label", {}, "Odaberi uređaj"),
    deviceSelector,
    elt("label", {}, "Početni datum i vrijeme"),
    startDate,
    elt("label", {}, "Završni datum i vrijeme"),
    endDate
  );
  const form = elt("form", {}, fielset);
  document.body.appendChild(form);