import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    getUsers();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get("http://localhost:8000/token");

      console.log(response.data);
      // console.log(response.data.data.accessToken);
      setToken(response.data.data.accessToken);

      const decoded = jwtDecode(response.data.data.accessToken);
      // console.log(decoded.userName);

      setName(decoded.userName);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        navigate("/login");
      }
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get("http://localhost:8000/token");

        config.headers.Authorization = `Bearer ${response.data.data.accessToken}`;

        setToken(response.data.data.accessToken);

        const decoded = jwtDecode(response.data.data.accessToken);

        setName(decoded.userName);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getUsers = async () => {
    try {
      const response = await axiosJWT.get("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data.data);
      setUsers(response.data.data);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
      }
    }
  };

  const toggleUserDetail = (userId) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="mt-3">
          <h3>Hello, Welcome back: {name}</h3>
          <p className="mt-5">Berikut data user:</p>
        </div>
        <div className="mt-3">
          {/* <button className="btn btn-info" onClick={getUsers}>
            Get Users
          </button> */}
        </div>
        <div className="mt-3">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                return (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="btn btn-info"
                        onClick={() => toggleUserDetail(user.id)}
                      >
                        {selectedUserId === user.id
                          ? "Hide Detail"
                          : "Lihat Detail"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-5">
            {users.map((user) => {
              return (
                selectedUserId === user.id && (
                  <div key={user.id}>
                    <h3>Detail User:</h3>
                    <p>ID: {user.id}</p>
                    <p>Name: {user.name}</p>
                    <p>Username: {user.username}</p>
                    <p>Email: {user.email}</p>
                  </div>
                )
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
