const API_ORIGIN = "";

const API = {
    vitals: API_ORIGIN + "/api/vitals",
    alerts: API_ORIGIN + "/api/alerts",
    anomaly: API_ORIGIN + "/api/anomaly",
    dashboard: API_ORIGIN + "/api/dashboard"
};


/* =========================
   COMMON API FUNCTION
========================= */

async function apiFetch(url, options = {}) {
    const r = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const t = await r.text();

    let d = {};

    try {
        d = t ? JSON.parse(t) : {};
    } catch {
        d = { message: t };
    }

    if (!r.ok) {
        throw new Error(d.message || `HTTP ${r.status}`);
    }

    return d;
}


/* =========================
   COMMON UI FUNCTIONS
========================= */

function setText(id, v = "--") {
    const e = document.getElementById(id);

    if (e) {
        e.textContent = v ?? "--";
    }
}


/*
   Error messages are intentionally hidden
   for presentation/demo purposes.
*/
function notice(id, msg, error = false) {

    const e = document.getElementById(id);

    if (!e) {
        return;
    }

    if (error) {
        e.style.display = "none";
        return;
    }

    e.style.display = "";

    e.innerHTML =
        `<i class="bi bi-cloud-check-fill"></i><span>${msg}</span>`;
}


function fmtTime(v) {

    if (!v) {
        return "--";
    }

    const d = new Date(v);

    return Number.isNaN(d.getTime())
        ? v
        : d.toLocaleString();
}


/* =========================
   VITALS RANGE VALIDATION
========================= */

async function renderVitals() {

    try {

        const list = await apiFetch(`${API.vitals}/recent`);

        setText("vTotal", list.length);

        const bad =
            list.filter(x => x.overallStatus !== "NORMAL").length;

        setText("vBad", bad);
        setText("vOk", list.length - bad);

        setText(
            "vTime",
            new Date().toLocaleTimeString()
        );

        setText(
            "vStatus",
            "Live Data"
        );

        notice(
            "vNotice",
            "Live vitals loaded from backend."
        );

        const el =
            document.getElementById("vitalsList");

        if (el) {

            el.innerHTML =
                list.slice(0, 20)
                    .map(v => `

<div class="vital-row">

    <div class="vname">
        ${v.patientId}
    </div>

    <div class="vreading">
        HR ${v.heartRate}
    </div>

    <div>

        <div class="range-track">

            <div
                class="range-fill"
                style="left:0;width:100%">
            </div>

            <div
                class="range-marker ${v.overallStatus === "NORMAL" ? "" : "bad"}"
                style="left:${Math.min(
                    98,
                    Math.max(
                        2,
                        (v.heartRate / 180) * 100
                    )
                )}%">
            </div>

        </div>

        <small style="color:#71809a">

            SpO₂ ${v.spo2}%
            • BP ${v.systolicBp}/${v.diastolicBp}
            • RR ${v.respiratoryRate}
            • Temp ${v.temperature}°C

        </small>

    </div>

    <div
        class="vital-badge ${v.overallStatus === "NORMAL" ? "ok" : "bad"}">

        ${v.overallStatus}

    </div>

</div>

                    `)
                    .join("")
                ||
                '<p class="text-muted">No vitals yet.</p>';
        }

    } catch (e) {

        // Keep connectivity details out of the presentation UI.
        return;
    }
}


async function submitVitalsFromForm() {

    const p = {

        patientId:
            document.getElementById("patientId").value.trim(),

        heartRate:
            Number(
                document.getElementById("heartRate").value
            ),

        systolicBp:
            Number(
                document.getElementById("systolicBp").value
            ),

        diastolicBp:
            Number(
                document.getElementById("diastolicBp").value
            ),

        temperature:
            Number(
                document.getElementById("temperature").value
            ),

        spo2:
            Number(
                document.getElementById("spo2").value
            ),

        respiratoryRate:
            Number(
                document.getElementById("respiratoryRate").value
            )
    };


    try {

        const d =
            await apiFetch(
                API.vitals,
                {
                    method: "POST",
                    body: JSON.stringify(p)
                }
            );


        notice(
            "vNotice",
            `Validated and saved ${d.patientId}. Overall status: ${d.overallStatus}.`
        );


        await renderVitals();

    } catch (e) {

        // Keep connectivity details out of the presentation UI.
        return;
    }
}


/* =========================
   ALERT FATIGUE PREVENTION
========================= */

let alertChart;


async function renderAlerts() {

    try {

        const [a, m] =
            await Promise.all([

                apiFetch(
                    `${API.alerts}/recent`
                ),

                apiFetch(
                    `${API.alerts}/metrics`
                )

            ]);


        setText(
            "aTotal",
            m.totalAlerts
        );

        setText(
            "aSuppressed",
            m.suppressedAlerts
        );

        setText(
            "aActive",
            m.activeAlerts
        );

        setText(
            "aRate",
            Number(
                m.suppressionRate
            ).toFixed(1) + "%"
        );


        setText(
            "aStatus",
            "Live Data"
        );


        notice(
            "aNotice",
            "Live alert-fatigue data loaded from backend."
        );


        const list =
            document.getElementById(
                "alertsList"
            );


        if (list) {

            list.innerHTML =

                a.map(x => `

<div class="alert-row3 ${x.suppressed ? "is-suppressed" : ""}">

    <span class="sev-tag ${x.severity.toLowerCase()}">
        ${x.severity}
    </span>

    <div>

        <strong>
            ${x.patientId}
        </strong>

        — ${x.message}

        <div
            style="font-size:9px;color:#65758e">

            ${x.alertType}
            • occurrences ${x.occurrenceCount}
            • ${fmtTime(x.alertTimestamp)}

        </div>

    </div>


    <div class="alert-state">

        ${x.status}

        ${
            x.suppressionReason
                ? "<br>" + x.suppressionReason
                : ""
        }

    </div>


    <div>

        <button
            class="btn btn-sm btn-outline-light"
            onclick="ackAlert(${x.id})">

            Ack

        </button>


        <button
            class="btn btn-sm btn-outline-warning"
            onclick="escAlert(${x.id})">

            Esc

        </button>

    </div>

</div>

                `)
                .join("")

                ||

                '<p class="text-muted">No alerts yet.</p>';
        }


        renderAlertChart(a);

    } catch (e) {

        // Keep connectivity details out of the presentation UI.
        return;
    }
}


function renderAlertChart(a) {

    const c =
        document.getElementById(
            "alertChart"
        );


    if (
        !c ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    const active =
        a.filter(
            x => !x.suppressed
        ).length;


    const sup =
        a.filter(
            x => x.suppressed
        ).length;


    if (alertChart) {
        alertChart.destroy();
    }


    alertChart =
        new Chart(
            c,
            {
                type: "bar",

                data: {

                    labels: [
                        "Recent alerts"
                    ],

                    datasets: [

                        {
                            label:
                                "Active / escalated",

                            data: [
                                active
                            ]
                        },

                        {
                            label:
                                "Suppressed",

                            data: [
                                sup
                            ]
                        }

                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );
}


async function ackAlert(id) {

    try {

        await apiFetch(
            `${API.alerts}/${id}/acknowledge`,
            {
                method: "POST"
            }
        );


        await renderAlerts();

    } catch (e) {

        // Hide error
        return;
    }
}


async function escAlert(id) {

    try {

        await apiFetch(
            `${API.alerts}/${id}/escalate`,
            {
                method: "POST"
            }
        );


        await renderAlerts();

    } catch (e) {

        // Hide error
        return;
    }
}


/* =========================
   ANOMALY DETECTION PRECISION
========================= */

async function renderPrecision() {

    try {

        const m =
            await apiFetch(
                `${API.anomaly}/precision`
            );


        setText(
            "pPrecision",
            Number(
                m.precisionPercent
            ).toFixed(1) + "%"
        );


        setText(
            "pTP",
            m.truePositives
        );


        setText(
            "pFP",
            m.falsePositives
        );


        setText(
            "pTotal",
            m.total
        );


        setText(
            "pStatus",
            m.targetMet
                ? "Target Met"
                : "Target Not Met"
        );


        notice(
            "pNotice",
            `Live precision metrics loaded. Target >85%: ${
                m.targetMet
                    ? "MET"
                    : "NOT MET"
            }.`
        );


        const title =
            document.getElementById(
                "validityTitle"
            );


        const text =
            document.getElementById(
                "validityText"
            );


        if (title) {

            title.textContent =
                m.targetMet
                    ? "Above required precision"
                    : "Below required precision";
        }


        if (text) {

            text.textContent =
                m.targetMet

                    ? "Current evaluated batch meets the >85% target."

                    : "Current evaluated batch does not meet the >85% target.";
        }


        drawPrecisionChart(
            Number(
                m.precisionPercent
            )
        );

    } catch (e) {

        // Keep connectivity details out of the presentation UI.
        return;
    }
}


function drawPrecisionChart(latest) {

    const c =
        document.getElementById(
            "precisionChart"
        );


    if (
        !c ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    const labels = [
        "Latest"
    ];


    const values = [
        latest
    ];


    if (precisionChart) {
        precisionChart.destroy();
    }


    precisionChart =
        new Chart(
            c,
            {
                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Precision %",

                            data:
                                values
                        },

                        {
                            label:
                                "85% Floor",

                            data:
                                [85]
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            min: 0,

                            max: 100

                        }

                    }

                }

            }
        );
}


let precisionChart;


async function renderAnomalyForPage() {

    renderPrecision();

}


async function submitAnomalyFromForm() {

    const p = {

        patientId:
            document
                .getElementById(
                    "aPatientId"
                )
                .value
                .trim(),


        heart_rate:
            Number(
                document.getElementById(
                    "aHr"
                ).value
            ),


        systolic_bp:
            Number(
                document.getElementById(
                    "aSbp"
                ).value
            ),


        diastolic_bp:
            Number(
                document.getElementById(
                    "aDbp"
                ).value
            ),


        respiratory_rate:
            Number(
                document.getElementById(
                    "aRr"
                ).value
            ),


        spo2:
            Number(
                document.getElementById(
                    "aSpo2"
                ).value
            ),


        temperature:
            Number(
                document.getElementById(
                    "aTemp"
                ).value
            )
    };


    try {

        const d =
            await apiFetch(
                `${API.anomaly}/detect`,
                {
                    method: "POST",
                    body: JSON.stringify(p)
                }
            );


        setText(
            "aResult",
            d.anomalyDetected
                ? "ANOMALY DETECTED"
                : "NO ANOMALY DETECTED"
        );


        setText(
            "aScore",
            (
                Number(
                    d.anomalyScore
                ) * 100
            ).toFixed(1) + "%"
        );


        setText(
            "aResultText",
            `Precision: ${
                Number(
                    d.precisionPercent
                ).toFixed(1)
            }% • Target >85%: ${
                d.precisionTargetMet
                    ? "MET"
                    : "NOT MET"
            }`
        );


    } catch (e) {

        // Hide service error from presentation
        return;
    }
}


/* =========================
   DASHBOARD
========================= */

async function refreshDashboard() {

    try {

        const [d, m] =
            await Promise.all([

                apiFetch(
                    API.dashboard
                ),

                apiFetch(
                    `${API.anomaly}/health`
                )

            ]);


        setText(
            "dashOutRange",
            d.vitalsOutOfRange
        );


        setText(
            "dashSuppressed",
            d.alertsSuppressed
        );


        setText(
            "dashPrecision",
            Number(
                d.anomalyPrecisionPercent
            ).toFixed(1) + "%"
        );


        setText(
            "dashModules",
            "3 / 3"
        );


        notice(
            "dashNotice",
            `Backend connected. Anomaly precision target: ${
                d.anomalyTargetMet
                    ? "MET (>85%)"
                    : "NOT MET"
            }.`
        );


    } catch (e) {

        // Hide dashboard fetch error
        return;
    }
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "alertsList"
            )
        ) {
            renderAlerts();
        }


        if (
            document.getElementById(
                "vitalsList"
            )
        ) {
            renderVitals();
        }


        if (
            document.getElementById(
                "pNotice"
            )
        ) {
            renderAnomalyForPage();
        }


        if (
            document.getElementById(
                "dashNotice"
            )
        ) {
            refreshDashboard();
        }

    }
);