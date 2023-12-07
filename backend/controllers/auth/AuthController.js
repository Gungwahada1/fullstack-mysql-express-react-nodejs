const Users = require("../../models/UserModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const register = async (req, res) => {
  const { name, username, email, password, cpassword } = req.body;

  // Cek data request
  if (!name || !username || !email || !password || !cpassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: "Harap isi semua bidang yang diperlukan.",
      },
    });
  }

  if (password !== cpassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: "Password dan Konfirmasi Password tidak sama.",
      },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Membuat user baru
    const newUser = await Users.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Berhasil register.",
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

const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        username: req.body.username,
      },
    });

    const match = await bcrypt.compare(req.body.password, user[0].password);

    if (!match) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Username atau Password salah.",
        },
      });
    }

    const userId = user[0].id;
    const userName = user[0].name;
    const userUsername = user[0].username;
    const userEmail = user[0].email;
    const accessToken = jwt.sign(
      { userId, userName, userUsername, userEmail },
      process.env.ACCESS_TOKEN_KEY,
      {
        expiresIn: "15s",
      }
    );
    const refreshToken = jwt.sign(
      { userId, userName, userUsername, userEmail },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "30m",
      }
    );

    await Users.update(
      {
        refresh_token: refreshToken,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httponly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // secure: true,  // Active if production in https
    });
    res.status(201).json({
      success: true,
      message: "Berhasil login",
      data: {
        accessToken,
      },
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

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(204).json({
        success: false,
        error: {
          code: 204,
          message: "Tidak ada refreshToken dalam permintaan.",
        },
      });

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user[0])
      return res.status(204).json({
        success: false,
        error: {
          code: 204,
          message: "Refresh token tidak valid.",
        },
      });

    const userId = user[0].id;
    await Users.update(
      {
        refresh_token: null,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Berhasil logout",
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
  register,
  login,
  logout,
};
