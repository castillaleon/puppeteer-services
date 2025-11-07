import puppeteer from "puppeteer";
import fs from "fs/promises";
// import devices from "./device-descriptors.json"; // 引入设备描述符
import _ from "lodash";
const page_list = [
  "https://emrnweb.eastmoney.com/nxfxb/home",
  "https://wap.eastmoney.com/quote/stock/1.000001.html?appfenxiang=1",
  "https://vipmoney.eastmoney.com/collect/app_ranking/ranking/app.html?#/stock",
  "https://vipmoney.eastmoney.com/collect/app_ranking/ranking/app.html?#/news",
  "https://vipmoney.eastmoney.com/collect/app_ranking/ranking/app.html?#/article",
  "https://emdata.eastmoney.com/home/indexh5.html",
  "https://wap.eastmoney.com/quote/hsbk.html",
  "https://emwap.eastmoney.com/quota/hq/global",
  "https://emdata.eastmoney.com/appdc/lhb/index.html#/lhb",
  "https://emrnweb.eastmoney.com/rzrq/Home",
  "https://emrnweb.eastmoney.com/zljc/list?type=0",
];
(async () => {
  const file = await fs.readFile("./device-descriptors.json", "utf8");
  const devices = JSON.parse(file);

  // 1. 启动浏览器（无头模式为默认行为，无需界面）
  const browser = await puppeteer.launch({
    headless: false, // 设置为false可在调试时看到浏览器界面
  });

  try {
    // 2. 创建一个新的页面标签页
    const page = await browser.newPage();

    // 设置全局超时
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(30000);

    // 拦截非必要请求
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let index = Math.floor((new Date().getHours() + 1) / 2);
    let max_index = _.size(devices);
    let device_options = max_index > index ? devices[index] : _.sample(devices);
    await page.emulate(device_options);

    // 3. 导航到目标URL
    const targetUrl = _.sample(page_list); // 请替换为你的目标URL
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 45000 }); // 等待页面基本加载完成

    // 4. 获取该域名下的所有Cookie
    const cookies = await page.cookies();
    console.log("获取到的Cookies:", cookies);
    if (_.size(cookies) == 0) {
      console.warn("无cookie");
      console.warn(targetUrl);
    }

    // （可选）5. 将Cookies保存为JSON文件
    // const fs = require("fs");

    await fs.writeFile(
      `cookies_${index}.json`,
      JSON.stringify(
        {
          "Cookie": _.map(cookies, (cookie) => {
            return `${cookie.name}=${cookie.value};`;
          }).join(""),
          url: targetUrl,
          "User-Agent": device_options.userAgent,
        },
        null,
        2
      )
    );
    console.log("Cookies已保存至cookies.json");
  } catch (error) {
    console.error("操作失败:", error);
  } finally {
    // 6. 确保最后关闭浏览器，释放资源
    await browser.close();
  }
})();
