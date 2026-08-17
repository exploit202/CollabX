const bcrypt = require("bcrypt");
const { sharedDB } = require("./src/config/db");
const User = require("./src/modules/auth/models/user.model");

const createTestCreator = async () => {
  try {
    await new Promise((resolve, reject) => {
      if (sharedDB.readyState === 1) {
        resolve();
      } else {
        sharedDB.once("connected", resolve);
        sharedDB.once("error", reject);
      }
    });

    const email = "fakecreator2026@gmail.com";

    // Avoid duplicate creator
    const existingCreator = await User.findOne({ email });

    if (existingCreator) {
      console.log("Creator already exists:");
      console.log(existingCreator);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Test@12345",
      10
    );

    const creator = await User.create({
      fullName: "Fake Test Creator",
      email,
      password: hashedPassword,
      role: "creator",
      profileImage: null,
      isVerified: false,
      isActive: true,
    });

    console.log("====================================");
    console.log("✅ TEST CREATOR CREATED");
    console.log("====================================");
    console.log("Name:", creator.fullName);
    console.log("Email:", creator.email);
    console.log("Password: Test@12345");
    console.log("Role:", creator.role);
    console.log("Active:", creator.isActive);
    console.log("User ID:", creator._id.toString());
    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create test creator:");
    console.error(error);
    process.exit(1);
  }
};

createTestCreator();