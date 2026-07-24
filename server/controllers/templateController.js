const Template = require('../models/Template');

/**
 * @desc    Get all SMS templates
 * @route   GET /api/templates
 * @access  Private
 */
const getTemplates = async (req, res, next) => {
  try {
    let templates = await Template.find().sort({ createdAt: -1 });

    // Seed default sample templates if empty
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          title: 'MTN Service Update (OTESS DATA)',
          message: 'Hello {{name}},\n\nWe are pleased to inform you that our MTN service is now fully stable.\n\nThank you for your patience.\n\nOTESS DATA',
          category: 'Service Announcement'
        },
        {
          title: 'Weekly Performance Alert',
          message: 'Hi {{name}},\n\nYour weekly sales report has been updated. Please verify your agent dashboard balance.\n\nRegards,\nOTESS DATA Team',
          category: 'Agents'
        },
        {
          title: 'General Notification',
          message: 'Dear {{name}},\n\nThank you for choosing OTESS DATA. Contact us if you require any assistance.\n\nOTESS DATA',
          category: 'General'
        }
      ];
      templates = await Template.insertMany(defaultTemplates);
    }

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new template
 * @route   POST /api/templates
 * @access  Private
 */
const createTemplate = async (req, res, next) => {
  try {
    const { title, message, category } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Template title and message content are required.' });
    }

    const template = await Template.create({
      title: title.trim(),
      message: message.trim(),
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update template
 * @route   PUT /api/templates/:id
 * @access  Private
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { title, message, category } = req.body;
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    if (title) template.title = title.trim();
    if (message) template.message = message.trim();
    if (category) template.category = category;

    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete template
 * @route   DELETE /api/templates/:id
 * @access  Private
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    await template.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
