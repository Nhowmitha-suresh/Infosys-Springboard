const RETRY_DELAY_MS = 5000;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function connectKafkaWithRetry(client, serviceName) {
  while (true) {
    try {
      await client.connect();
      return;
    } catch (error) {
      console.error(`${serviceName} cannot reach Kafka: ${error.message}. Retrying in ${RETRY_DELAY_MS / 1000}s.`);
      await delay(RETRY_DELAY_MS);
    }
  }
}

module.exports = { connectKafkaWithRetry };