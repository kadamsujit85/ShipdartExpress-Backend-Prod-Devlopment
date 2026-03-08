const axios = require("axios");

// ---------- Module-level constants and helpers ----------

// C: commonly used constants (content-types, timeouts, courier codes, etc.)
const C = {
  FORM_CT: "application/x-www-form-urlencoded",
  JSON_CT: "application/json",
  TIMEOUT_MS: 20000,
  COURIER: { DLV: "DLV", DTDC: "DTDC", XBEES: "XBEES" },
  PAY_REVERSE: "reverse",
};

// ---------- utils ----------

/**
 * prune(obj)
 * Remove keys from an object whose values are null, undefined, or empty string.
 * Useful for building payloads where you don't want to send empty fields.
 */
function prune(obj) { return Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== null && v !== undefined && v !== "")); }

/**
 * toStr(v)
 * Convert a value to a string safely. Null/undefined become empty string.
 * Useful when building form values or logging.
 */
function toStr(v) { return (v === null || v === undefined ? "" : String(v)); }

/**
 * safeJson(x)
 * Safely parse JSON if input is a string. If parsing fails, return the original value.
 * If input is already an object, return it unchanged.
 */
function safeJson(x) { if (typeof x === "string") { try { return JSON.parse(x); } catch { return x; } } return x; }

/**
 * toBoolInt(v)
 * Normalizes common truthy values to integer 1, everything else to 0.
 * Accepts booleans, numbers, and string representations like '1' or 'true'.
 */
function toBoolInt(v) {
  return (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true') ? 1 : 0;
}

/**
 * safeString(v)
 * Trim a value and return null if it's undefined, null, or empty after trimming.
 * This helps maintain null semantics in DB inserts or API payloads.
 */
function safeString(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

/**
 * safeInt(v)
 * Parse a value as integer and return null for invalid/empty inputs.
 * Returns an integer when parseInt succeeds; otherwise null.
 */
function safeInt(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = parseInt(v, 10);
  return Number.isInteger(n) ? n : null;
}

// ---------- HTTP clients ----------

/**
 * postForm(url, token, payload)
 * POST a payload as form-encoded (format=json&data=...) with an Authorization Token header.
 * Returns an object with { status, data } where data is safely JSON-parsed if possible.
 * Uses a custom validateStatus so non-2xx responses don't throw.
 */
async function postForm(url, token, payload) {
  const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
  const resp = await axios.post(url, body, { headers: { Authorization: `Token ${token}`, "Content-Type": C.FORM_CT }, timeout: C.TIMEOUT_MS, validateStatus: () => true });
  return { status: resp.status, data: safeJson(resp.data) };
}

/**
 * postJson(url, body, headers = {})
 * POST a JSON body (application/json). Merges additional headers if provided.
 * Returns { status, data } with safe JSON parsing.
 */
async function postJson(url, body, headers = {}) {
  const resp = await axios.post(url, body, { headers: { "Content-Type": C.JSON_CT, ...headers }, timeout: C.TIMEOUT_MS, validateStatus: () => true });
  return { status: resp.status, data: safeJson(resp.data) };
}

// ---------- CMU response guard (handy for Delhivery) ----------

/**
 * ensureCmuOk(d)
 * Validate a response shape from certain courier APIs (e.g., Delhivery CMU responses).
 * Returns the first package object if response.success === true and packages array exists
 * and the first package has a waybill; otherwise returns null.
 */
function ensureCmuOk(d) { return d && d.success === true && Array.isArray(d.packages) && d.packages[0]?.waybill ? d.packages[0] : null; }

// ---------- DB repos ----------

/**
 * fetchShippedOrder(m2, orderId)
 * Query the database for a shipped order (ORDER_STATUS = 'D') and return key details
 * used to build shipments, labels or reverse shipments.
 */
async function fetchShippedOrder(m2, orderId) {
  return m2.executeDataQuery(`
    SELECT o.ID, o.CUSTOMER_ID, o.ORDER_NO, o.ORDER_AMOUNT,
           o.DELIVER_TO AS CONSIGNEE_NAME, o.ADDRESS AS CONSIGNEE_ADDRESS,
           o.LANDMARK AS CONSIGNEE_LANDMARK, o.MOBILE_NO AS CONSIGNEE_PHONE,
           pm1.PINCODE AS CONSIGNEE_PIN, pm1.CITY_NAME AS CONSIGNEE_CITY, sm1.STATE_NAME AS CONSIGNEE_STATE,
           o.DEAD_WEIGHT, o.CHARGABLE_WEIGHT, o.LENGTH, o.WIDTH, o.HEIGHT, o.PAYMENT_MODE,
           o.PICKUP_CONTACT_PERSON, o.PICKUP_MOBILE_NO, o.PICKUP_ADDRESS, o.PICKUP_LANDMARK,
           pm2.PINCODE AS WH_PIN, pm2.CITY_NAME AS WH_CITY, sm2.STATE_NAME AS WH_STATE, p.PRODUCT_NAME
    FROM order_master o
    LEFT JOIN product_master  p   ON o.PRODUCT_ID = p.ID
    LEFT JOIN pincode_master pm1 ON pm1.ID = o.PINCODE_ID
    LEFT JOIN state_master sm1   ON sm1.ID   = pm1.STATE_ID
    LEFT JOIN pincode_master pm2 ON pm2.ID   = o.PICKUP_PINCODE_ID
    LEFT JOIN state_master sm2   ON sm2.ID   = pm2.STATE_ID
    WHERE o.ID = ? AND o.ORDER_STATUS = 'D'
    LIMIT 1`, [orderId]);
}

/**
 * fetchWarehouse(m2, customerId)
 * Retrieve the primary (first active) warehouse/address for a given customer.
 * Returns contact details and pin/state information to use as pickup point.
 */
async function fetchWarehouse(m2, customerId) {
  return m2.executeDataQuery(`
    SELECT a.CONTACT_PERSON AS WH_NAME, a.MOBILE_NO AS WH_PHONE,
           a.ADDRESS AS WH_ADDRESS, a.LANDMARK AS WH_LANDMARK,
           a.DELHIVERY_CLIENT_ID AS WH_CLIENT,
           pm.PINCODE AS WH_PIN, pm.CITY_NAME AS WH_CITY, sm.STATE_NAME AS WH_STATE
    FROM address_master a
    LEFT JOIN pincode_master pm ON pm.ID = a.PINCODE_ID
    LEFT JOIN state_master sm    ON sm.ID = pm.STATE_ID
    WHERE a.CUSTOMER_ID = ? AND a.STATUS = 1
    ORDER BY a.ID ASC LIMIT 1`, [customerId]);
}

/**
 * insertReverseRecord(m2, systemDate, params)
 * Insert a reverse-shipment record into reverse_shipment_master table.
 * Accepts an object 'params' containing orderId, awb, status, courierId, courierName, paymentType, labelUrl, manifestUrl, raw
 * and stores the raw response JSON plus timestamps.
 */
async function insertReverseRecord(m2, systemDate, params) {
  const { orderId, awb, status, courierId, courierName, paymentType, labelUrl, manifestUrl, raw } = params;
  return m2.executeTransactions([{
    query: `
      INSERT INTO reverse_shipment_master
        (ORDER_ID, SHIPMENT_ID, AWB_NO, STATUS, COURIER_ID, COURIER_NAME,
         PAYMENT_TYPE, LABEL_URL, MANIFEST_URL, RESPONSE_DATA, CREATED_DATE, UPDATED_DATE)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data: [orderId, null, awb, status, courierId, courierName, paymentType, labelUrl || null, manifestUrl || null, JSON.stringify(raw), systemDate, systemDate],
  }]);
}

// ---------- Ekart specific ----------

/**
 * resolveEkartLocationCode(m2, customerId)
 * (Placeholder) Resolve a location code used by Ekart. Currently returns an environment variable
 * or empty string. TODO: replace with a DB lookup when available.
 */
async function resolveEkartLocationCode(m2, customerId) {
  // TODO: replace with DB lookup later
  const code = process.env.EKART_DEFAULT_LOCATION_CODE || "";
  return toStr(code);
}

/**
 * fetchOrderItemsForShipment(m2, orderId)
 * Get line items for an order (product name, unit price, quantity, category) to include on manifests/labels.
 * Returns an array of rows (or empty array if none).
 */
async function fetchOrderItemsForShipment(m2, orderId) {
  const sql = `SELECT PRODUCT_NAME, PER_UNIT_PRICE, TOTAL_UNIT, PRODUCT_CATEGORY FROM order_details WHERE ORDER_ID = ?`;
  const rows = await m2.executeDataQuery(sql, [orderId]);
  return Array.isArray(rows) ? rows : [];
}

/**
 * normalizeLabelData(body)
 * Normalize/whitelist label configuration fields coming from clients or DB.
 * Ensures expected fields exist with sensible defaults and coerces boolean-ish flags to 0/1.
 */
function normalizeLabelData(body) {
  // fields we expect
  const fields = {
    ICON_URL: null,
    IS_SHOW_ICON_URL: 0,
    IS_SHOW_TO_MOBILE_NO: 0,
    IS_SHOW_FROM_MOBILE_NO: 0,
    IS_SHOW_RETURN_MOBILE_NO: 0,
    IS_SHOW_RETURN_ADDRESS: 0,
    IS_THERMAL: 0,
    IS_DEFAULT_STANDARD: 0,
    IS_SHOW_MOBILE_NO: 0, // existing
    LOGO: null,
    CUSTOMER_ID: null
  };

  Object.keys(fields).forEach(k => {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
      // for boolean-ish fields, coerce to 0/1
      if (k.startsWith('IS_')) {
        // accept true/false, "1"/"0", 1/0
        const v = body[k];
        fields[k] = (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0;
      } else {
        fields[k] = body[k];
      }
    } else {
      // leave default (null or 0)
      fields[k] = fields[k];
    }
  });

  return fields;
}


// ---------- exports ----------
module.exports = {
  prune,
  toStr,
  safeJson,
  C,
  postForm,
  postJson,
  ensureCmuOk,
  fetchShippedOrder,
  fetchWarehouse,
  insertReverseRecord,
  resolveEkartLocationCode,
  fetchOrderItemsForShipment,
  normalizeLabelData,
  toBoolInt, 
  safeString,
  safeInt
};
