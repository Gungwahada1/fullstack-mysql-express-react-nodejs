const Users = require("../models/UserModel.js");
const bcrypt = require("bcrypt");

const getAllUser = async (req, res) => {
  try {
    // const dataUser = await Users.findAll();
    // Mengambil sebagian data
    const dataUser = await Users.findAll({
      attributes: ["id", "name", "username", "email"],
    });
    res.status(200).json({
      success: true,
      message: "Berhasil get data",
      data: dataUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const dataUser = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      success: true,
      message: "Berhasil get data",
      data: dataUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Cek data request
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Harap isi semua bidang yang diperlukan.",
        },
      });
    }

    // Mengenkripsi password sebelum menyimpannya ke dalam database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru
    const newUser = await Users.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Berhasil tambah data",
      data: newUser,
    });
  } catch (error) {
    // Deteksi persamaan nilai properti
    if (error.name === "SequelizeUniqueConstraintError") {
      let errorMessage = "";
      // Mendeteksi field yang memiliki kesalahan unik
      if (error.fields.username) {
        errorMessage = "Username sudah digunakan.";
      } else if (error.fields.email) {
        errorMessage = "Email sudah terdaftar.";
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: errorMessage,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const updatedFields = {};

    // Mengecek setiap field yang ingin diupdate
    if (name) {
      updatedFields.name = name;
    }
    if (username) {
      updatedFields.username = username;
    }
    if (email) {
      updatedFields.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    // Jika tidak ada isi request, tidak melakukan pembaharuan
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Tidak ada data yang diperbarui.",
        },
      });
    }

    // Memperbaharui user
    const [updatedUser] = await Users.update(updatedFields, {
      where: {
        id: req.params.id,
      },
    });

    // Jika tidak ada data yang diperbarui (id tidak ditemukan)
    if (updatedUser === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: "ID pengguna tidak ditemukan",
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Berhasil update data",
      id: req.params.id,
    });
  } catch (error) {
    // Deteksi persamaan nilai properti
    if (error.name === "SequelizeUniqueConstraintError") {
      let errorMessage = "";
      // Mendeteksi field yang memiliki kesalahan unik
      if (error.fields.username) {
        errorMessage = "Username sudah digunakan.";
      } else if (error.fields.email) {
        errorMessage = "Email sudah terdaftar.";
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: errorMessage,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUserCount = await Users.destroy({
      where: {
        id: req.params.id,
      },
    });

    // Cek id user
    if (deletedUserCount === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: "ID pengguna tidak ditemukan",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil delete data",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

module.exports = {
  getAllUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
