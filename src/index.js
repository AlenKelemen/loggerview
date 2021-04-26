import { elt } from "./util";
import dayjs from "dayjs";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
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
//make startDate & endDate correct
startDate.addEventListener("change", (evt) => {
  if (startDate.value > endDate.value) startDate.value = dayjs(endDate.value).subtract(1,'hour').format("YYYY-MM-DDTHH:mm");
});
endDate.addEventListener("change", (evt) => {
  if (endDate.value < startDate.value) endDate.value = dayjs(startDate.value).add(1,'hour').format("YYYY-MM-DDTHH:mm");
});
//form for input
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

//form for result data

//wait to aquire data
const wait = elt('div',{style:'text-align:center'},elt('i',{className:"far fa-spinner fa-spin fa-2x"}));
wait.style.width = endDate.clientWidth + 'px'
const resultFielset = elt(
  "fieldset",
  { style: "margin-left:1em" },
  wait
);
const result = elt("form", {}, resultFielset);
document.body.appendChild(result);


