import * as yup from "yup";
import { UI_STRINGS } from "../constants";

export const productInformationSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required(UI_STRINGS.PRODUCTS.VALIDATION.TITLE_REQUIRED)
    .max(150, UI_STRINGS.PRODUCTS.VALIDATION.TITLE_MAX),

  description: yup.string().trim().required(UI_STRINGS.PRODUCTS.VALIDATION.DESCRIPTION_REQUIRED),

  product_image: yup
    .string()
    .required(UI_STRINGS.PRODUCTS.VALIDATION.IMAGE_REQUIRED)
    .url(UI_STRINGS.PRODUCTS.VALIDATION.IMAGE_URL),

  status: yup
    .mixed<"active" | "inactive">()
    .oneOf(["active", "inactive"])
    .required(UI_STRINGS.PRODUCTS.VALIDATION.STATUS_REQUIRED),

  attribute_set: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
    })
    .nullable()
    .required(UI_STRINGS.PRODUCTS.VALIDATION.ATTRIBUTE_SET_REQUIRED),

  meta_title: yup.string().trim().max(255, UI_STRINGS.PRODUCTS.VALIDATION.META_TITLE_MAX),

  meta_key: yup.string().trim().max(255, UI_STRINGS.PRODUCTS.VALIDATION.META_KEYWORDS_MAX),

  meta_description: yup
    .string()
    .trim()
    .max(500, UI_STRINGS.PRODUCTS.VALIDATION.META_DESCRIPTION_MAX),
});

const variantSchema = yup.object({
  id: yup.number().optional(),

  title: yup.string().trim().required(UI_STRINGS.PRODUCTS.VALIDATION.VARIANT_TITLE_REQUIRED),

  code: yup.string().trim().required(UI_STRINGS.PRODUCTS.VALIDATION.VARIANT_CODE_REQUIRED),

  price: yup
    .string()
    .required(UI_STRINGS.PRODUCTS.VALIDATION.PRICE_REQUIRED)
    .test("valid-price", UI_STRINGS.PRODUCTS.VALIDATION.PRICE_INVALID, (value) =>
      value ? /^\d+(\.\d{1,2})?$/.test(value) : false,
    ),

  fake_price: yup
    .string()
    .required(UI_STRINGS.PRODUCTS.VALIDATION.FAKE_PRICE_REQUIRED)
    .test("valid-fake-price", UI_STRINGS.PRODUCTS.VALIDATION.FAKE_PRICE_INVALID, (value) =>
      value ? /^\d+(\.\d{1,2})?$/.test(value) : false,
    ),

  available_quantity: yup
    .number()
    .typeError(UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_INVALID)
    .integer(UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_INTEGER)
    .min(0, UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_NEGATIVE)
    .required(UI_STRINGS.PRODUCTS.VALIDATION.AVAILABLE_REQUIRED),

  on_hand_quantity: yup
    .number()
    .typeError(UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_INVALID)
    .integer(UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_INTEGER)
    .min(0, UI_STRINGS.PRODUCTS.VALIDATION.QUANTITY_NEGATIVE)
    .required(UI_STRINGS.PRODUCTS.VALIDATION.ON_HAND_REQUIRED),

  product_variant_image: yup
    .array()
    .of(yup.string().url(UI_STRINGS.PRODUCTS.VALIDATION.VARIANT_IMAGE_URL))
    .default([]),

  status: yup
    .mixed<"active" | "inactive">()
    .oneOf(["active", "inactive"])
    .required(UI_STRINGS.PRODUCTS.VALIDATION.STATUS_REQUIRED),
});

export const productFormSchema = productInformationSchema.shape({
  variants: yup
    .array()
    .of(variantSchema)
    .min(1, UI_STRINGS.PRODUCTS.VALIDATION.VARIANTS_MIN)
    .required(UI_STRINGS.PRODUCTS.VALIDATION.VARIANTS_REQUIRED),

  variantAttributes: yup.array().of(
    yup.object({
      id: yup.number().required(),
      name: yup.string().required(),
    }),
  ),
});
