import { elt } from "./util";
import dayjs from "dayjs";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";

//header
const header = elt("h1", {}, "Mjerenja na vodoopskrbnoj mreži");
document.body.appendChild(header);
//start&end datetime
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt(
  "select",
  {},
  elt("option", { value: "177" }, "Korčula 1"),//
);
req(deviceSelector.value)
deviceSelector.addEventListener('change', evt => req(evt.target.value));
startDate.value = dayjs().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = dayjs().format("YYYY-MM-DDTHH:mm");
//make startDate & endDate correct
startDate.addEventListener("change", (evt) => {
  if (startDate.value > endDate.value)
    startDate.value = dayjs(endDate.value)
      .subtract(1, "hour")
      .format("YYYY-MM-DDTHH:mm");
});
endDate.addEventListener("change", (evt) => {
  if (endDate.value < startDate.value)
    endDate.value = dayjs(startDate.value)
      .add(1, "hour")
      .format("YYYY-MM-DDTHH:mm");
});
//form for input
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
// form for wait for data
//display wait graphics
const progress = elt(
  "span",
  { className: "progress" }
);
//info
const info = elt("p", {}, "Preuzimanje mjerenja...");//
const wait = elt(
  "fieldset",
  {},
 info,
 progress
);
document.body.appendChild(elt("form", {}, wait));

//form for data required

//report
const report = elt("p", {}, "");//
//table
const tbody = elt("tbody", {});
const tbl = elt(
  "table",{},
  elt(
    "thead",
    {},
    elt(
      "tr",
      {},
      elt("th", {}, "Datum"),
      elt("th", {}, "Vrijeme"),
      elt("th", {}, "Tlak bar"),
      elt("th", {}, "Protok l/s")
    )
  ),
  tbody
);
//download
const download = elt(
  "a",
  {
    href: "data:text/plain;charset=utf-8," + encodeURIComponent(""),
    download: "Mjerenja.csv",
  },
  "Preuzmi..."
);
//graph
const canvas = elt("canvas", { height: "100%", width: "100%" });

const resultFielset = elt("fieldset", {}, 
progress,  
report,
tbl,
download,
canvas
);
const result = elt("form", {style:'display:none'}, resultFielset);
document.body.appendChild(result);


function req (deviceId){
  const pressurePromise = fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." +
      deviceId
  );
  const flowPromise = fetch(
    "https://gis.edc.hr/imagisth/threport/flow_mt_th"//more devices ?
  );
  Promise.all([pressurePromise, flowPromise]).then((r) => {
    Promise.all([r[0].json(), r[1].json()]).then((r) => {
      const m =[];//measures
      //console.log(r)
      for(const value of r[0]){
        m.push({timestamp:value.date_taken,pressure:value.pressure})
      }
      //console.log(m)
      for (const value of m){
        const f = r[1].filter(x => x.date_taken === value.timestamp)
        const hi = f.find(x => x.category_id == 10);
        const low = f.find(x => x.category_id == 11);
        console.log(f,hi.raw_value,low.raw_value)
      }
    })
  })
}