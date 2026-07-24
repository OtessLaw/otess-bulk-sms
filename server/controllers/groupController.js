const Group = require('../models/Group');
const Contact = require('../models/Contact');

/**
 * @desc    Get all Groups with contact counts
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = async (req, res, next) => {
  try {
    let groups = await Group.find().sort({ createdAt: -1 });

    // Seed default groups if database has no groups yet
    if (groups.length === 0) {
      const defaultGroups = [
        { name: 'Agents', description: 'Field and sales agents', color: '#3b82f6' },
        { name: 'Customers', description: 'Regular OTESS DATA client base', color: '#10b981' },
        { name: 'VIP', description: 'High-priority VIP clients', color: '#f59e0b' },
        { name: 'Inactive Agents', description: 'Deactivated or non-responsive agents', color: '#ef4444' }
      ];
      groups = await Group.insertMany(defaultGroups);
    }

    // Attach count of active contacts in each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const contactCount = await Contact.countDocuments({ groupName: group.name });
        return {
          ...group.toObject(),
          contactCount
        };
      })
    );

    res.status(200).json({
      success: true,
      groups: groupsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new Group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Group name is required.' });
    }

    const existingGroup = await Group.findOne({ name: name.trim() });
    if (existingGroup) {
      return res.status(400).json({ success: false, message: `Group "${name}" already exists.` });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      color: color || '#3b82f6'
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a Group
 * @route   PUT /api/groups/:id
 * @access  Private
 */
const updateGroup = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const oldName = group.name;

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (color) group.color = color;

    await group.save();

    // If group name changed, update all contacts associated with the old group name
    if (name && oldName !== name.trim()) {
      await Contact.updateMany({ groupName: oldName }, { groupName: name.trim() });
    }

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Group
 * @route   DELETE /api/groups/:id
 * @access  Private
 */
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Move associated contacts to 'General' group
    await Contact.updateMany({ groupName: group.name }, { groupName: 'General' });

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: `Group "${group.name}" deleted successfully. Associated contacts moved to General.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup
};
