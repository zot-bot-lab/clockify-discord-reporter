const { Client, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { USERS } = require("./users.js");

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Function to convert ISO 8601 duration (PT5H30M) to seconds
function parseISODuration(duration) {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
  if (!match) return 0;
  const [, h, m, s] = match.map(x => parseInt(x || "0"));
  return h * 3600 + m * 60 + s;
}

async function getClockifyLogs() {
  const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;
  const headers = {
    "X-Api-Key": process.env.CLOCKIFY_API_KEY,
    "Content-Type": "application/json"
  };

  // Get the last working day's date in Sri Lanka timezone (UTC+5:30)
  const now = new Date();

  // Get today in Sri Lankan timezone
  const sriLankaFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });

  // Determine how many days to go back based on current day
  const todayParts = sriLankaFormatter.formatToParts(now);
  const dayOfWeek = todayParts.find(p => p.type === 'weekday').value;

  let daysToGoBack = 1; // Default: yesterday

  // If today is Monday, go back 3 days to get Friday
  if (dayOfWeek === 'Mon') {
    daysToGoBack = 3;
  }

  const targetDate = new Date(now.getTime() - daysToGoBack * 24 * 60 * 60 * 1000);
  const targetDateInSL = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(targetDate);

  const [year, month, day] = targetDateInSL.split('-');
  const displayDate = `${day}/${month}/${year}`;
  const targetDateStr = targetDateInSL; // YYYY-MM-DD format

  // Query a wider range to make sure we get all logs
  // Go from 5 days ago to today to cover all possible timezone overlaps and weekends
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const startUTC = fiveDaysAgo.toISOString();
  const endUTC = tomorrow.toISOString();

  console.log(`\n========================================`);
  console.log(`Today: ${dayOfWeek} - Going back ${daysToGoBack} day(s)`);
  console.log(`TARGET DATE: ${displayDate} (${targetDateStr}) Sri Lankan Time`);
  console.log(`Query range (wide): ${startUTC} to ${endUTC}`);
  console.log(`========================================\n`);

  let reportLines = [`Time log issues ${displayDate}`];

  for (const [userId, discordTag] of Object.entries(USERS)) {
    try {
      // Use the time-entries endpoint instead of reports
      const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?start=${startUTC}&end=${endUTC}`;

      console.log(`Fetching logs for <@${discordTag}>...`);
      console.log(`URL: ${url}`);

      const reportRes = await fetch(url, {
        method: "GET",
        headers
      });

      if (!reportRes.ok) {
        const errorText = await reportRes.text();
        console.error(`Clockify API error for <@${discordTag}>: ${reportRes.status}`);
        console.error(`Response: ${errorText}`);
        reportLines.push(`<@${discordTag}>\n- Error fetching logs`);
        continue;
      }

      const logs = await reportRes.json();
      console.log(`\n--- <@${discordTag}> ---`);
      console.log(`Total logs returned: ${logs.length}`);

      if (!logs || !logs.length) {
        reportLines.push(`$<@{discordTag}>\n- No logs`);
        continue;
      }

      // Filter logs - only include if BOTH start AND end are within target date
      const targetDateLogs = logs.filter(log => {
        if (!log.timeInterval?.start || !log.timeInterval?.end) return false;

        const logStart = new Date(log.timeInterval.start);
        const logEnd = new Date(log.timeInterval.end);

        // Format both start and end time to Sri Lankan date
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Colombo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        const startDateStr = dateFormatter.format(logStart);
        const endDateStr = dateFormatter.format(logEnd);

        // Include log only if it starts on the target date
        // (We use start time as the primary indicator of which day the work was done)
        const isIncluded = startDateStr === targetDateStr;

        // Create time formatter for display
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Colombo',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const startTime = timeFormatter.format(logStart);
        const endTime = timeFormatter.format(logEnd);

        console.log(
          `  ${isIncluded ? '✓' : '✗'} [${startDateStr} ${startTime}] to [${endDateStr} ${endTime}] - ${log.timeInterval.duration} - "${log.description?.substring(0, 40) || '(empty)'}"`
        );

        return isIncluded;
      });

      console.log(`Filtered logs (included): ${targetDateLogs.length}`);

      if (!targetDateLogs.length) {
        reportLines.push(`<@${discordTag}>\n- No logs`);
        continue;
      }

      let totalSeconds = 0;
      let hasEmptyDescription = false;

      for (const log of targetDateLogs) {
        if (!log.description || log.description.trim() === "") {
          hasEmptyDescription = true;
        }
        if (log.timeInterval?.duration) {
          totalSeconds += parseISODuration(log.timeInterval.duration);
        }
      }

      const totalHours = totalSeconds / 3600;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      const timeLogged = `${hours}h ${minutes}m`;

      const issues = [];
      if (hasEmptyDescription) {
        issues.push("Descriptions missing");
      }
      if (totalHours < 6) {
        issues.push("Logs missing");
      }

      if (issues.length > 0) {
        reportLines.push(`<@${discordTag}> (${timeLogged})\n- ${issues.join("\n- ")}`);
      }
    } catch (error) {
      console.error(`Error processing logs for <@${discordTag}>:`, error);
      reportLines.push(`<@${discordTag}>\n- Error fetching logs`);
    }
  }

  return reportLines.join("\n");
}

// Run every weekday (Mon–Fri) at 4:00 PM Colombo time
cron.schedule(
  "0 16 * * 1-5",  // 4:00 PM = 16:00
  async () => {
    try {
      const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      const report = await getClockifyLogs();
      await channel.send({
        content: report,
        allowedMentions: { parse: ['users'] }
      });
      console.log("✅ Report sent successfully");
    } catch (err) {
      console.error("Error sending report:", err);
    }
  },
  {
    timezone: "Asia/Colombo"
  }
);

client.once("clientReady", async () => {
  console.log(`✅ Bot is running as ${client.user.tag}`);

  // If running in GitHub Actions, send report immediately and exit
  if (process.env.GITHUB_ACTIONS) {
    console.log('Running in GitHub Actions mode - sending report now...');
    try {
      const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      const report = await getClockifyLogs();
      await channel.send({
        content: report,
        allowedMentions: { parse: ['users'] }
      });
      console.log("✅ Report sent successfully");
      process.exit(0); // Exit after sending
    } catch (err) {
      console.error("Error sending report:", err);
      process.exit(1); // Exit with error
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// Test call - remove in production or keep for local testing
getClockifyLogs().then(console.log);