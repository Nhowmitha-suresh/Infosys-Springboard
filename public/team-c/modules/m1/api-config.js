const localApi = {
	FHIR: [],
	CONSENT: [],
	AUDIT: [window.MEDISPHERE_AUDIT_API || "http://localhost:8080"]
};

window.MEDISPHERE_API = localApi;
