import Content from "../Models/ContentModel.js";

// ================= GET PAGE CONTENT =================
export const getContent = async (req, res) => {
  try {
    const { page } = req.params;
    const content = await Content.findOne({ page });

    if (!content) {
      // Return default empty structure if not found, or handle initialization
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: content.data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE PAGE CONTENT =================
export const updateContent = async (req, res) => {
  try {
    const { page } = req.params;
    const { data } = req.body;

    console.log(`Updating content for page: ${page}`);
    // console.log("Data to save:", JSON.stringify(data, null, 2));

    let content = await Content.findOne({ page });

    if (!content) {
      content = new Content({ page, data });
    } else {
      content.data = data;
      // Mark as modified to ensure Mongoose saves the object structure
      content.markModified('data');
    }

    await content.save();

    res.json({
      success: true,
      message: "Content updated successfully",
      data: content.data
    });
  } catch (error) {
    console.error("Error in updateContent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
