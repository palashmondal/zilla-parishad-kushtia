const usersModel = require('../models/users.model');
const bcrypt = require('bcryptjs');

/**
 * Get all users with optional search
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const users = await usersModel.getAllUsers(search);
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'ব্যবহারকারী তালিকা লোড করতে ব্যর্থ' });
    }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usersModel.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'ব্যবহারকারী লোড করতে ব্যর্থ' });
    }
};

/**
 * Create new user
 */
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, full_name, designation, office_name, role, is_active } = req.body;

        // Validation
        if (!username || !password || !full_name) {
            return res.status(400).json({ message: 'ইউজারনেম, পাসওয়ার্ড এবং নাম আবশ্যক' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' });
        }

        // Check if username exists
        const existingUser = await usersModel.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে' });
        }

        // Check if email exists (if provided)
        if (email) {
            const existingEmail = await usersModel.getUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে' });
            }
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const userId = await usersModel.createUser({
            username,
            email: email || null,
            password_hash,
            full_name,
            designation: designation || null,
            office_name: office_name || null,
            role: role || 'user',
            is_active: is_active !== undefined ? is_active : true,
            created_by: req.user.id
        });

        res.status(201).json({
            message: 'ব্যবহারকারী সফলভাবে তৈরি হয়েছে',
            id: userId
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'ব্যবহারকারী তৈরি করতে ব্যর্থ' });
    }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, full_name, designation, office_name, role, is_active } = req.body;

        // Check if user exists
        const existingUser = await usersModel.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' });
        }

        // Prevent user from changing their own role or status
        if (parseInt(id) === req.user.id) {
            if (role && role !== existingUser.role) {
                return res.status(400).json({ message: 'আপনি নিজের ভূমিকা পরিবর্তন করতে পারবেন না' });
            }
            if (is_active !== undefined && is_active !== existingUser.is_active) {
                return res.status(400).json({ message: 'আপনি নিজের অবস্থা পরিবর্তন করতে পারবেন না' });
            }
        }

        // Check username uniqueness (if changed)
        if (username && username !== existingUser.username) {
            const usernameExists = await usersModel.getUserByUsername(username);
            if (usernameExists) {
                return res.status(400).json({ message: 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে' });
            }
        }

        // Check email uniqueness (if changed)
        if (email && email !== existingUser.email) {
            const emailExists = await usersModel.getUserByEmail(email);
            if (emailExists) {
                return res.status(400).json({ message: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে' });
            }
        }

        const updateData = {
            username: username || existingUser.username,
            email: email !== undefined ? email : existingUser.email,
            full_name: full_name || existingUser.full_name,
            designation: designation !== undefined ? designation : existingUser.designation,
            office_name: office_name !== undefined ? office_name : existingUser.office_name,
            role: role || existingUser.role,
            is_active: is_active !== undefined ? is_active : existingUser.is_active
        };

        // Hash new password if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' });
            }
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        await usersModel.updateUser(id, updateData);

        res.json({ message: 'ব্যবহারকারী সফলভাবে আপডেট হয়েছে' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'ব্যবহারকারী আপডেট করতে ব্যর্থ' });
    }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent user from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'আপনি নিজেকে মুছে ফেলতে পারবেন না' });
        }

        // Check if user exists
        const user = await usersModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' });
        }

        await usersModel.deleteUser(id);

        res.json({ message: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'ব্যবহারকারী মুছতে ব্যর্থ' });
    }
};
