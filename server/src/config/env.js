const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const optionalWithDefaults = {
  REFRESH_SECRET: process.env.JWT_SECRET || "default_refresh_secret_key",
  ADMIN_SIGNUP_CODE: "ADMIN123",
};

let missing = [];
required.forEach((key) => {
  if (!process.env[key]) {
    missing.push(key);
  }
});

Object.entries(optionalWithDefaults).forEach(([key, defaultValue]) => {
  if (!process.env[key]) {
    process.env[key] = defaultValue;
  }
});

if (missing.length > 0) {
  console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`);
} else {
  console.log("✅ All core environment variables loaded");
}
