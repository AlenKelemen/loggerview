import { elt } from "./util";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Chart from "chart.js";
import "chartjs-adapter-dayjs";

/* import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css"; */

dayjs.extend(utc); // server dates in utc
//header
const header = elt("h1", {}, "Mjerenja na vodoopskrbnoj mreži");
document.body.appendChild(header);
//--
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
//--
//status info
const status = elt("p", {}, "Preuzimam podatke ...");
document.body.appendChild(status);
//--
//download data
const download = elt(
  "a",
  {
    href: "data:text/plain;charset=utf-8," + encodeURIComponent(""),
    download: `${
      deviceSelector.options[deviceSelector.selectedIndex].text
    }_${dayjs(startDate.value).format("DD.MM.YYYY HH:mm")}_${dayjs(
      endDate.value
    ).format("DD.MM.YYYY HH:mm")}.csv`,
  },
  "Preuzmi..."
);
const dwlForm = elt(
  "form",
  { style: "display:none" },
  elt("fieldset", {}, download)
);
document.body.appendChild(dwlForm);
//--
// graph
const canvas = elt("canvas", { height: "100%", width: "100%" });
const graphForm = elt("form", {}, elt("fieldset", {}, canvas));
document.body.appendChild(graphForm);
const ctx = canvas.getContext("2d");
const config = {
  type: "line",
  data: {
    datasets: [{}],
  },
  options: {
    scales: {
      x: 
        {
          type: "time",
          time: {
            displayFormats: {
                quarter: 'MMM YYYY'
            }
        }
        },
    },
  },
};
let chart = new Chart(canvas, config);
//--
//tabular data report
const tbody = elt("tbody", {});
const tbl = elt(
  "table",
  {},
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
const tblForm = elt(
  "form",
  { style: "display:none" },
  elt("fieldset", {}, tbl)
);
document.body.appendChild(tblForm);
//--
//req data on input form  change
req(); //for initial page
form.addEventListener("change", (evt) => {
  req();
});
//--
function req() {
  /*
   reads value from UX: deviceSelector,startDate,endDate;
   sets display style 'none' on req received: status
   call on change
  */
  /* console.clear();
  console.log(
    "...requesting data for: ",
    deviceSelector.value,
    startDate.value,
    endDate.value
  ); */
  //UX results
  status.style.display = "inline";
  status.innerText = "Preuzimam podatke ...";
  tblForm.style.display = "none";
  dwlForm.style.display = "none";
  graphForm.style.display = "none";
  //--
  const pressurePromise = fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." +
      deviceSelector.value
  ); // dates not used in req
  const flowPromise = fetch(
    "https://gis.edc.hr/imagisth/threport/flow_mt_th" //more devices ?
  ); // device && dates not used in req
  Promise.all([pressurePromise, flowPromise]).then((r) => {
    Promise.all([r[0].json(), r[1].json()]).then((r) => {
      const m = []; //measures calculated
      for (const value of r[0]) {
        const f = r[1].filter((x) => x.date_taken === value.date_taken); // 2 flow messages for date_taken
        const hi = f.find((x) => x.category_id == 11); // hi bit
        let low = f.find((x) => x.category_id == 10); //low bit
        low = hi.raw_value * 65536 + low.raw_value; //sum values
        low = Math.round((low * 0.01 + Number.EPSILON) * 100) / 100; //round value 2 decimals
        const t = dayjs.utc(value.date_taken.split("+")[0]).local(); //.format('DD.MM.YYYY HH:mm')// convert to local time
        m.push({ timestamp: t, pressure: value.pressure, flowSum: low });
      }
      for (let i = 0; i < m.length; i++) {
        if (i === 0) {
          //first row, can't calculate diff, set 0
          m[i].timeDiff = 0;
          m[i].flowDiff = 0;
        } else {
          m[i].timeDiff = m[i].timestamp.diff(m[i - 1].timestamp) / 60000; //miliseconds -> min
          m[i].flowDiff =
            ((m[i].flowSum - m[i - 1].flowSum) * 60) / m[i].timeDiff / 3.6; // l/s
        }
      }
      const p = period(m);
      if (p.length === 0) {
        status.innerText = "Nema podataka!";
        tbody.innerHTML = "";
      } else {
        //console
        /* console.clear();
        console.log(p); */
        //status
        status.style.display = "none";
        //download
        dwlForm.style.display = "block";
        download.href =
          "data:text/plain;charset=utf-8," + encodeURIComponent(csv(p));
        download.download = `${
          deviceSelector.options[deviceSelector.selectedIndex].text
        }_${dayjs(startDate.value).format("DD.MM.YYYY HH:mm")}_${dayjs(
          endDate.value
        ).format("DD.MM.YYYY HH:mm")}.csv`;
        //graph
        graphForm.style.display = "block";
        graphIt(p, chart);
        //table
        tblForm.style.display = "block";
        fillTbl(tbody, p);
      }
    });
  });
}
function graphIt(p) {
  chart.data.labels = [];
  chart.data.datasets[0].data =[];
  chart.update();
  for (const v of p){
    chart.data.datasets[0].data.push({
      x : v.timestamp,
      y :v.pressure
    })
  }
  chart.update();
}
function csv(p) {
  //values as csv text
  let s =
    "Datum;Vrijeme;Tlak bar;Protok l/s;Sumarni protok m3;Stanje vodomjera m3\n";
  const flowStart = p[0].flowSum;
  for (const [index, value] of p.entries()) {
    let pstring = value.pressure.toFixed(2);
    pstring = pstring.replace(".", ",");
    let fstring = value.flowDiff.toFixed(2);
    fstring = fstring.replace(".", ",");
    fSumString = (value.flowSum - flowStart).toFixed(2);
    fSumString = fSumString.replace(".", ",");
    stanje = value.flowSum.toFixed(0);
    s += `${value.timestamp.format("DD.MM.YYYY")};${value.timestamp.format(
      "HH:mm:ss"
    )};${pstring};${fstring};${fSumString};${stanje}\n`;
  }
  return s;
}
function fillTbl(tbody, p) {
  tbody.innerHTML = "";
  const rp= p.slice().reverse(); //last data first to show
  for (const value of rp) {
    tbody.appendChild(
      elt(
        "tr",
        {},
        elt("td", {}, value.timestamp.format("DD.MM.YYYY")),
        elt("td", {}, value.timestamp.format("HH:mm:ss")),
        elt("td", {}, value.pressure.toFixed(2)),
        elt("td", {}, value.flowDiff.toFixed(2))
      )
    );
  }
}
function period(m) {
  //reads startDate & endDate from UX
  const p = [];
  for (const value of m) {
    if (
      value.timestamp.isAfter(dayjs(startDate.value)) &&
      value.timestamp.isBefore(dayjs(endDate.value))
    )
      p.push(value);
  }
  return p;
}
