import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    name: "",
  });
  const { email, password, name } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  //   const handleError = (err) =>
  // toast.error(err, {
  //   position: "bottom-left",
  // });
  //   const handleSuccess = (msg) =>
  //     toast.success(msg, {
  //       position: "bottom-right",
  //     });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Generate avatar based on user’s name or email
    const avatarUrl = `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
      name
    )}&backgroundColor=ffd5dc,ffdfbf`;
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/signup",
        {
          ...inputValue,
          avatar: avatarUrl, // 👈 include avatar in signup payload
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        // handleSuccess(message);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        // handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      name: "",
    });
  };

  return (
    <div className="form_container">
      <h2>Signup Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="email">Name</label>
          <input
            type="text"
            name="name"
            value={name}
            placeholder="Enter your name"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
        <span>
          Already have an account? <Link to={"/login"}>Login</Link>
        </span>
      </form>
      {/* <ToastContainer /> */}
    </div>
  );
};

export default SignUpPage;
