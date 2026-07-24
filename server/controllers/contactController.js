const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const Contact = require('../models/Contact');
const Group = require('../models/Group');

/**
 * @desc    Get contacts with pagination, search, group filter
 * @route   GET /api/contacts
 * @access  Private
 */
const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const { search, group, status } = req.query;

    const query = {};

    if (group && group !== 'All') {
      query.groupName = group;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ];
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      contacts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add single contact
 * @route   POST /api/contacts
 * @access  Private
 */
const addContact = async (req, res, next) => {
  try {
    const { name, phone, email, groupName, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const contact = await Contact.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      groupName: groupName || 'Agents',
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit contact
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
const updateContact = async (req, res, next) => {
  try {
    const { name, phone, email, groupName, status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    if (name) contact.name = name.trim();
    if (phone) contact.phone = phone.trim();
    if (email !== undefined) contact.email = email.trim();
    if (groupName) contact.groupName = groupName;
    if (status) contact.status = status;

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single contact
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk Delete Contacts
 * @route   POST /api/contacts/bulk-delete
 * @access  Private
 */
const bulkDeleteContacts = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide array of contact IDs to delete.' });
    }

    const result = await Contact.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Smart column detection from Excel header row
 */
const detectColumns = (rowObject) => {
  const keys = Object.keys(rowObject);
  
  let nameKey = keys.find(k => /name|fullname|agent|contact/i.test(k));
  let phoneKey = keys.find(k => /phone|mobile|number|tel|contact/i.test(k));
  let emailKey = keys.find(k => /email|mail/i.test(k));
  let groupKey = keys.find(k => /group|category|department/i.test(k));
  let statusKey = keys.find(k => /status|state|active/i.test(k));

  return {
    nameKey: nameKey || keys[0],
    phoneKey: phoneKey || keys[1] || keys[0],
    emailKey: emailKey,
    groupKey: groupKey,
    statusKey: statusKey
  };
};

/**
 * @desc    Import Contacts via Excel (.xlsx, .xls) or CSV
 * @route   POST /api/contacts/import
 * @access  Private
 */
const importContacts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel (.xlsx) or CSV file.' });
    }

    // Parse Excel/CSV file from memory buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded spreadsheet is empty.' });
    }

    const colMap = detectColumns(rawData[0]);

    const importedContacts = [];
    const groupNameSet = new Set();

    for (const row of rawData) {
      const name = String(row[colMap.nameKey] || '').trim();
      const phone = String(row[colMap.phoneKey] || '').replace(/[^0-9+]/g, '').trim();
      const email = colMap.emailKey ? String(row[colMap.emailKey] || '').trim() : '';
      const groupName = colMap.groupKey && row[colMap.groupKey] ? String(row[colMap.groupKey]).trim() : 'Agents';
      const status = colMap.statusKey && /inactive/i.test(String(row[colMap.statusKey])) ? 'Inactive' : 'Active';

      if (name && phone) {
        importedContacts.push({
          name,
          phone,
          email,
          groupName,
          status
        });

        groupNameSet.add(groupName);
      }
    }

    if (importedContacts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid contact records found in uploaded file. Check column headers.' });
    }

    // Auto-create any new groups encountered during import
    for (const gName of groupNameSet) {
      await Group.findOneAndUpdate(
        { name: gName },
        { name: gName, description: 'Auto-created during Excel import' },
        { upsert: true, new: true }
      );
    }

    // Bulk insert contacts into MongoDB database
    const inserted = await Contact.insertMany(importedContacts, { ordered: false });

    res.status(200).json({
      success: true,
      message: `Successfully imported ${inserted.length} contact(s).`,
      importedCount: inserted.length,
      preview: inserted.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Contacts to formatted Excel file using ExcelJS
 * @route   GET /api/contacts/export
 * @access  Private
 */
const exportContacts = async (req, res, next) => {
  try {
    const { group } = req.query;
    const query = group && group !== 'All' ? { groupName: group } : {};

    const contacts = await Contact.find(query).sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OTESS DATA Contacts');

    // Define styled columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Group', key: 'groupName', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created Date', key: 'createdAt', width: 22 }
    ];

    // Style the header row (Blue background, bold white text)
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' } // OTESS Deep Blue
    };

    contacts.forEach((c) => {
      worksheet.addRow({
        name: c.name,
        phone: c.phone,
        email: c.email || 'N/A',
        groupName: c.groupName || 'General',
        status: c.status,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `OTESS_Contacts_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  importContacts,
  exportContacts
};
