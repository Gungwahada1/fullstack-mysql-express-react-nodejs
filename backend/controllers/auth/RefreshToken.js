const Users = require("../../models/UserModel.js");
const jwt = require("jsonwebtoken");

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: "Tidak ada refreshToken dalam permintaan.",
        },
      });

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user[0])
      return res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: "Refresh token tidak valid.",
        },
      });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decoded) => {
      if (err)
        return res.status(403).json({
          success: false,
          error: {
            code: 403,
            message: "Refresh token tidak valid.",
          },
        });

      const userId = user[0].id;
      const userName = user[0].name;
      const userUsername = user[0].username;
      const userEmail = user[0].email;
      const accessToken = jwt.sign(
        {
          userId,
          userName,
          userUsername,
          userEmail,
        },
        process.env.ACCESS_TOKEN_KEY,
        {
          expiresIn: "15s",
        }
      );
      return res.status(200).json({
        success: true,
        message: "Token akses baru berhasil diperbarui.",
        data: {
          accessToken,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};

module.exports = { refreshToken };
