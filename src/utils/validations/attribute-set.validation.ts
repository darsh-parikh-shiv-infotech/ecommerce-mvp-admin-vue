import * as yup from "yup";
import { UI_STRINGS } from "../constants";

export const attributeSetSchema = yup.object({
  name: yup.string().trim().required(UI_STRINGS.ATTRIBUTE_SET.NAME_REQUIRED),

  attribute_id: yup
    .array()
    .of(yup.number().required())
    .min(1, UI_STRINGS.ATTRIBUTE_SET.ATTRIBUTES_REQUIRED)
    .required(UI_STRINGS.ATTRIBUTE_SET.ATTRIBUTES_REQUIRED),

  status: yup.mixed<"active" | "inactive">().oneOf(["active", "inactive"]).required(),
});
