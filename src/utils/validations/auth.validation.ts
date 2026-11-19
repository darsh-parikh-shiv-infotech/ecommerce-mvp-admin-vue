import * as yup from "yup";
import { AUTH_MESSAGES } from "../constants";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required(AUTH_MESSAGES.EMAIL_REQUIRED)
    .email(AUTH_MESSAGES.EMAIL_INVALID),

  password: yup.string().required(AUTH_MESSAGES.PASSWORD_REQUIRED),
});
