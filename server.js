const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rituanuragi1@gmail.com",
    pass: "geon ylan rgeq mfld", // Ensure you use a secure app-specific password
  },
});

// Generate a random OTP
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// Store generated OTPs and corresponding email addresses
const otpMap = new Map();

// Route to send OTP email
app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  const OTP = generateOTP();

  // Store OTP with email for verification
  otpMap.set(email, OTP);

  // Email content
  const mailOptions = {
    from: "rituanuragi1@gmail.com",
    to: email,
    subject: "OTP Verification",
    html: `<p>Your OTP for verification: ${OTP}</p>`,
  };

  // Sending the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      res.status(500).send("Error sending OTP email");
    } else {
      console.log("OTP email sent:", info.response);
      res.status(200).send("OTP email sent successfully");
    }
  });
});

// Route to verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const storedOTP = otpMap.get(email);

  if (otp === storedOTP) {
    // OTP is correct
    otpMap.delete(email); // Remove OTP from storage after successful verification
    res.status(200).send("OTP verified successfully");
  } else {
    // Incorrect OTP
    res.status(400).send("Incorrect OTP");
  }
});

// Route for handling form submission
app.post("/submit-form", (req, res) => {
  const formData = req.body;
  console.log("Form Data:", formData);

  const email = formData.email;
  if (!otpMap.has(email) || formData.otp !== otpMap.get(email)) {
    // If email is not verified or OTP is incorrect, send error response
    res
      .status(400)
      .send("Email verification failed. Please enter the correct OTP.");
    return;
  }

  // Determine the bank name (either from the dropdown or the other bank input)
  const bankName =
    formData.bankName === "Other" ? formData.otherBankName : formData.bankName;

  // Email content
  const mailOptions = {
    from: "rituanuragi1@gmail.com",
    to: "rituf2fintech@gmail.com",
    subject: "New Form Submission",
    html: `
      <p>Full Name: ${formData.fullName}</p>
      <p>Bank: ${bankName}</p>
      <p>Post in Bank: ${formData.post}</p>
      <p>State: ${formData.state}</p>
      <p>City: ${formData.city}</p>
      <p>Product: ${formData.product}</p>
      <p>Office Address: ${formData.officeAddress}</p>
      <p>Email Address: ${formData.email}</p>
      <p>WhatsApp Number: ${formData.whatsapp}</p>
    `,
  };

  // Sending the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
