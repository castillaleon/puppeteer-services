
import cp from 'child_process';
import schedule from 'node-schedule'; 
import _ from 'lodash';  
 

schedule.scheduleJob('0 59 * * * *', function (fireDate) {
  console.info('get eastmoney cookie ' + getDateTimeString());
  try {
    cp.exec('node /Users/wmacstudio/Documents/puppeteer-services/start.js', {
      encoding: 'utf-8',
    });
  } catch (e) {}
});