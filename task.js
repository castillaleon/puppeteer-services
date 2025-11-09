import cp, { fork } from "child_process";
import schedule from "node-schedule";
import _ from "lodash";

export function format(date, f) {
  var format = f || "yyyy-MM-dd hh:mm:ss";
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
}

export function getDateTimeString() {
  return format(new Date(), "yyyy-MM-dd hh:mm:ss");
}

schedule.scheduleJob("0 59 * * * *", function (fireDate) {
  console.info("get eastmoney cookie " + getDateTimeString());
  try {
    cp.fork("/Users/wmacstudio/Documents/puppeteer-services/start.js", {
      env: process.env,
      stdio: "inherit",
    });
  } catch (e) {}
});
