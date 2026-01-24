import Content from "../Models/ContentModel.js";
import { sendContactEmail } from "../Helpers/SendMail.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Fetch the admin support email from the content model
    const contactContent = await Content.findOne({ page: "contactPage" });
    
    // Default fallback email if not found in DB
    let adminEmail = process.env.EMAIL_USER;
    
    if (contactContent && contactContent.data && contactContent.data.contactInfo && contactContent.data.contactInfo.email) {
      adminEmail = contactContent.data.contactInfo.email;
    }

    console.log(`Sending contact form submission to admin email: ${adminEmail}`);

    await sendContactEmail(adminEmail, { name, email, message });

    res.json({
      success: true,
      message: "Your transmission has been received. Our team will gear up and respond shortly."
    });

  } catch (error) {
    console.error("Error in submitContactForm:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send transmission. Please try again later."
    });
  }
};
