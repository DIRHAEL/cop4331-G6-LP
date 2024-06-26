import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Form from "@radix-ui/react-form";
import { useToast } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";

import { buildPath } from "./buildPath";

const Login = () => {
  // Login States
  const [loginEmail, setEmail] = useState("");
  const [loginPassword, setPassword] = useState("");
  const toast = useToast();

  // SignUp States
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [userName, setUserName] = useState("");
  const [signupEmail, setSignUpEmail] = useState("");
  const [signupPassword, setSignUpPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [message, setMessage] = useState("");

  function isValidPassword(password) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    return regex.test(password);
  }

  function forgotPassword() {
    window.location.href = "/forgot";
  }

  return (
    <ChakraProvider>
      <Tabs.Root
        className="flex flex-col w-[300px] shadow-[0_2px_10px]"
        defaultValue="tab1"
      >
        <Tabs.List
          className="shrink-0 flex border-b"
          aria-label="Manage your account"
        >
          <Tabs.Trigger
            className="bg-black px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] text-white leading-none select-none first:rounded-tl-md last:rounded-tr-md hover:text-purple-200 data-[state=active]:text-purple-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-purple-500 outline-none cursor-default"
            value="tab1"
          >
            Sign-In
          </Tabs.Trigger>
          <Tabs.Trigger
            className="bg-black px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] text-white leading-none select-none first:rounded-tl-md last:rounded-tr-md hover:text-purple-200 data-[state=active]:text-purple-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-purple-500 outline-none cursor-default"
            value="tab2"
          >
            Sign-Up
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          className="grow p-5 bg-black rounded-b-md outline-none focus:shadow-[0_0_0_2px]"
          value="tab1"
        >
          <p className="text-white text-center font-extrabold text-xl leading-normal">
            <span className="bg-gradient-to-r from-purple-500 via-purple-300 to-purple-500 text-transparent bg-clip-text">
              Log in
            </span>{" "}
            to your account
          </p>
          <p className="text-center text-xs mb-5 text-white">
            Welcome back! Please enter your details
          </p>

          <Form.Root
            className="w-[260px]"
            onSubmit={async (event) => {
              event.preventDefault();

              let obj = {
                login: loginEmail,
                password: loginPassword,
              };
              // login : sdfsdfas
              // password : dsfsdafasd
              let js = JSON.stringify(obj);

              try {
                const response = await fetch(buildPath("/api/login"), {
                  method: "POST",
                  body: js,
                  headers: { "Content-Type": "application/json" },
                });

                const res = JSON.parse(await response.text());

                console.log(res);

                if (res.id <= 0) {
                  toast({
                    title: "An error occurred.",
                    description: "Username/password incorrect",
                    status: "error",
                    position: "top",
                    duration: 9000,
                    isClosable: true,
                  });
                } else {
                  const user = {
                    firstName: res.firstName,
                    lastName: res.lastName,
                    username: res.username,
                  };
                  localStorage.setItem("user_data", JSON.stringify(user));
                  setMessage("");
                  window.location.href = "/map";
                }
              } catch (e) {
                alert(e.toString());
                return;
              }
            }}
          >
            <Form.Field className="grid mb-[10px]" name="email">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Email
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter your email
                </Form.Message>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="typeMismatch"
                >
                  Please provide a valid email
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none  "
                  type="email"
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="question">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Password
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please provide a password
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none"
                  type="password"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
              <button className="box-border w-full text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-purple-400 hover:bg-purple-600 px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
                Submit
              </button>
            </Form.Submit>
          </Form.Root>
        </Tabs.Content>
        <Tabs.Content
          className="grow p-5 bg-black rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="tab2"
        >
          <p className="text-white text-center text-xl leading-normal font-extrabold">
            Create a new account
          </p>
          <p className="text-center text-xs mb-5 text-white" s>
            To use Memory Map enter your details
          </p>
          <Form.Root
            className="w-[260px]"
            onSubmit={async (event) => {
              event.preventDefault();

              let obj = {
                firstName: firstName,
                lastName: lastName,
                username: userName,
                email: signupEmail,
                password: signupPassword,
              };

              if (!isValidPassword(signupPassword)) {
                toast({
                  title: "Password Error",
                  description:
                    "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.",
                  status: "error",
                  position: "top",
                  duration: 12000,
                  isClosable: true,
                });
                return;
              }

              let js = JSON.stringify(obj);
              console.log(js);

              try {
                const response = await fetch(buildPath("/api/createuser"), {
                  method: "POST",
                  body: js,
                  headers: { "Content-Type": "application/json" },
                });

                // 200 goood, 400, username/email already exists, 500 really bad
                let serverCode = response.status;

                const res = JSON.parse(await response.text());

                // Good user is signed up
                if (serverCode === 200) {
                  toast({
                    title: "Account created.",
                    description: "We've created your account",
                    status: "success",
                    position: "top",
                    duration: "9000",
                    isClosable: true,
                  });

                  toast({
                    title: "Reminder",
                    description: "Please verify your email.",
                    status: "info",
                    position: "top-left",
                    duration: "9000",
                    isClosable: true,
                  });
                } else if (serverCode === 400) {
                  toast({
                    title: "An error occurred.",
                    description: "Username/email already exists",
                    status: "error",
                    position: "top",
                    duration: 9000,
                    isClosable: true,
                  });
                }

                // Check if the username or email already exists
                // TODO
                // - Switch the user to enter the page when signed up or logged in.
              } catch (e) {
                alert(e.toString());
                return;
              }
            }}
          >
            <Form.Field className="grid mb-[10px]" name="email">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  First Name
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter your first name
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none"
                  type="text"
                  required
                  onChange={(e) => {
                    setFirst(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="question">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Last Name
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please provide a last name
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none"
                  type="text"
                  required
                  onChange={(e) => {
                    setLast(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="question">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Username
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please provide a username
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none"
                  type="text"
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="email">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Email
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter your email
                </Form.Message>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="typeMismatch"
                >
                  Please provide a valid email
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none  "
                  type="email"
                  required
                  onChange={(e) => {
                    setSignUpEmail(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="question">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Password
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please provide a password
                </Form.Message>
              </div>

              <Form.Control asChild>
                <input
                  className="box-border bg-black w-full shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-[#5B625F] focus:text-purple-400 shadow-[0_0_0_1px] outline-none"
                  type="password"
                  required
                  onChange={(e) => {
                    setSignUpPassword(e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
              <button className="box-border w-full text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-purple-400 hover:bg-purple-600 px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
                Submit
              </button>
            </Form.Submit>
          </Form.Root>
        </Tabs.Content>
      </Tabs.Root>
    </ChakraProvider>
  );
};

export default Login;
