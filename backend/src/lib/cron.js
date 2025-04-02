import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", () => {
    https
        .get(process.env.API_URL, (res) => {
            console.log(`Cron job executed: ${res.statusCode}`);
        })
        .on("error", (e) => {
            console.error(`Error executing cron job: ${e.message}`);
        });
});

export default job;

// * 14 * * * * *  // At minute 14 past every hour
// * 0 14 * * *    // At 14:00 (2 PM) every day
// * 0 0 * * *    // At midnight every day
// * 0 0 * * 1    // At midnight every Monday
// * 0 0 * * 1    // At midnight every Monday
// * 0 0 * * 1-5  // At midnight every weekday (Monday to Friday)
// * 0 0 * * 1-5,6 // At midnight every weekday and Saturday
// * 0 0 * * 1-5,6-7 // At midnight every weekday and Saturday and Sunday
