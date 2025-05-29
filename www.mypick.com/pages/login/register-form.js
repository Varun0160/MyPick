import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Input from "@/components/Input";
import Button from "@/components/Button";
import { emailRegister, registerDatabase } from "@/firebase/register";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("* Name is required.")
    .min(2, "* Name is too short"),
  surname: yup
    .string()
    .required("* Surname is required.")
    .min(2, "* Surname is too short"),
  email: yup.string().email().required("* Email is required."),
  password: yup
    .string()
    .required("* Password is required.")
    .min(8, "* Password is too short - should be 8 chars minimum."),
});

export default function RegisterForm() {
  const [registerError, setRegisterError] = useState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password, name, surname }) => {
    try {
      const response = await emailRegister({ email, password });
      
      await registerDatabase({
        id: response.user.uid,
        email,
        name,
        surname,
      });
      
      setRegisterError("You have registered successfully. You can login now");
    } catch (error) {
      setRegisterError(error.message || "Failed to register. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", paddingTop: 0 }}
    >
      <Input
        placeholder="Name"
        error={errors?.name?.message}
        {...register("name", { required: true })}
      />
      {errors?.name && (
        <span style={{ color: "red", marginTop: 4, fontSize: 14 }}>
          {errors.name.message}
        </span>
      )}

      <Input
        placeholder="Surname"
        error={errors?.surname?.message}
        {...register("surname", { required: true })}
      />
      {errors?.surname && (
        <span style={{ color: "red", marginTop: 4, fontSize: 14 }}>
          {errors.surname.message}
        </span>
      )}

      <Input
        type="email"
        placeholder="E-mail"
        error={errors?.email?.message}
        {...register("email", { required: true })}
      />
      {errors?.email && (
        <span style={{ color: "red", marginTop: 4, fontSize: 14 }}>
          {errors.email.message}
        </span>
      )}

      <Input
        type="password"
        placeholder="Password"
        error={errors?.password?.message}
        {...register("password", { required: true })}
      />
      {errors?.password && (
        <span style={{ color: "red", marginTop: 4, fontSize: 14 }}>
          {errors.password.message}
        </span>
      )}

      <Button type="submit">Register</Button>
      {registerError && (
        <span
          style={{
            color: registerError.includes("successfully") ? "green" : "red",
            marginTop: 10,
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          {registerError}
        </span>
      )}
    </form>
  );
}
