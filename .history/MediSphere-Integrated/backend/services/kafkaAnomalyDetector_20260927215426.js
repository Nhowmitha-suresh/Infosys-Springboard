const { kafka } = require("../config/kafka");
const { connectKafkaWithRetry } = require("./kafkaConnection");

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP || "medisphere-anomaly-detection-group",
});

const alertApiBaseUrl = process.env.ALERT_API_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 5000}/api`;


/*
 * =========================================================
 * HEART RATE ANOMALY DETECTION
 * =========================================================
 */

function detectHeartRateAnomaly(telemetry) {

  const heartRate = Number(telemetry.value);

  if (!Number.isFinite(heartRate)) {

    return {
      anomaly: false,
      severity: "NORMAL",
      message: "Invalid heart-rate value",
    };
  }


  if (heartRate > 140) {

    return {
      anomaly: true,
      severity: "HIGH",
      message:
        `High heart rate detected: ${heartRate} bpm`,
    };
  }


  if (heartRate < 50) {

    return {
      anomaly: true,
      severity: "HIGH",
      message:
        `Low heart rate detected: ${heartRate} bpm`,
    };
  }


  return {
    anomaly: false,
    severity: "NORMAL",
    message:
      `Heart rate normal: ${heartRate} bpm`,
  };
}


/*
 * =========================================================
 * SEND ANOMALY TO EXISTING ALERT ENGINE
 * =========================================================
 *
 * The Alert Engine already exists in:
 *
 * backend/services/alertEngine.cjs
 *
 * We call it directly here.
 */

async function sendToAlertEngine(telemetry) {

  try {

    const response = await fetch(
      `${alertApiBaseUrl.replace(/\/$/, "")}/alerts/analyze`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        signal: AbortSignal.timeout(8000),

        body: JSON.stringify({

          patientId:
            telemetry.patientId,

          patientName:
            telemetry.patientName,

          heartRate:
            telemetry.value,

          /*
           * Temporary baseline.
           *
           * Later this will come from
           * patient-specific telemetry history.
           */

          previousAverage: 90,

        }),
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        `Alert Engine returned ${response.status}`
      );

    }


    if (data.alertCreated) {

      console.log(
        "🚨 Alert Engine created MongoDB alert:",
        data.alert
      );

    } else {

      console.log(
        "Alert Engine processed telemetry. No alert created."
      );

    }


    return data;

  } catch (error) {

    console.error(
      "Failed to send anomaly to Alert Engine:",
      error
    );

  }
}


/*
 * =========================================================
 * START KAFKA ANOMALY DETECTOR
 * =========================================================
 */

async function startKafkaAnomalyDetector() {

  try {

    await connectKafkaWithRetry(consumer, "Kafka anomaly detector");

    console.log(
      "Kafka Anomaly Detector connected."
    );


    await consumer.subscribe({

      topic: "wearable-telemetry",

      fromBeginning: false,

    });


    console.log(
      "Kafka Anomaly Detector subscribed to wearable-telemetry."
    );


    await consumer.run({

      eachMessage: async ({
        topic,
        partition,
        message
      }) => {

        try {

          const telemetry =
            JSON.parse(
              message.value.toString()
            );


          console.log(
            "\nTelemetry received from Kafka:"
          );

          console.log(
            telemetry
          );


          /*
           * ---------------------------------------------
           * HEART RATE ANOMALY DETECTION
           * ---------------------------------------------
           */

          if (
            telemetry.vitalType ===
            "HEART_RATE"
          ) {

            const result =
              detectHeartRateAnomaly(
                telemetry
              );


            console.log(
              "Anomaly Detection Result:",
              result
            );


            /*
             * -------------------------------------------
             * ANOMALY DETECTED
             * -------------------------------------------
             */

            if (result.anomaly) {

              console.log(
                "🚨 ANOMALY DETECTED"
              );

              console.log({

                patientId:
                  telemetry.patientId,

                patientName:
                  telemetry.patientName,

                heartRate:
                  telemetry.value,

                severity:
                  result.severity,

                message:
                  result.message,

              });


              /*
               * Send the telemetry to the
               * existing Alert Engine.
               */

              await sendToAlertEngine(
                telemetry
              );

            }

          }

        } catch (error) {

          console.error(
            "Failed to process Kafka telemetry:",
            error
          );

        }

      },

    });

  } catch (error) {

    console.error(
      "Kafka Anomaly Detector Error:",
      error
    );

  }

}


module.exports = {
  startKafkaAnomalyDetector,
};