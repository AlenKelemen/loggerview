import { elt } from "./util";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
dayjs.extend(utc);
//header
const header = elt("h1", {}, "Mjerenja na vodoopskrbnoj mreži");
document.body.appendChild(header);

//input form
const deviceSelector = elt(
  "select",
  {},
  elt("option", { value: "177" }, "Korčula 1"), //
  elt("option", { value: "178" }, "Korčula 2") // fake for test
);
const startDate = elt("input", {
  type: "datetime-local",
  value: dayjs().subtract(1, "days").format("YYYY-MM-DDTHH:mm"),
});
const endDate = elt("input", {
  type: "datetime-local",
  value: dayjs().format("YYYY-MM-DDTHH:mm"),
});
const fielset = elt(
  "fieldset",
  {},
  elt("label", {}, "Odaberi uređaj"),
  deviceSelector,
  elt("label", {}, "Početni datum i vrijeme"),
  startDate,
  elt("label", {}, "Završni datum i vrijeme"),
  endDate
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);
//req data on input change
req()//default
form.addEventListener("change", (evt) => {
  req();//request data
})

function req() {
  console.log(
    "requesting data for:",
    deviceSelector.value,
    startDate.value,
    endDate.value
  );
  const pressurePromise = fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." + deviceSelector.value
  );
  const flowPromise = fetch(
    "https://gis.edc.hr/imagisth/threport/flow_mt_th" //more devices ?
  );
  Promise.all([pressurePromise, flowPromise]).then((r) => {
    Promise.all([r[0].json(), r[1].json()]).then((r) => {
      const m = []; //measures
      console.log(r)
      for (const value of r[0]) {
        const a = dayjs.utc(value.date_taken)
        const l =a.local()
        console.log(l.format())
      }
    })
  })
}
