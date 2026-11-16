import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import type { AttributeSetPayload } from "../../store/attribute-set.store";
import { attributeSetSchema } from "../validations/attribute-set.validation";

export function useAttributeSetForm(initialValues: AttributeSetPayload) {
  const { defineField, errors, handleSubmit, resetForm, meta } = useForm<AttributeSetPayload>({
    validationSchema: toTypedSchema(attributeSetSchema),
    initialValues,
  });

  const [name, nameAttrs] = defineField("name");
  const [attributeId, attributeIdAttrs] = defineField("attribute_id");
  const [status, statusAttrs] = defineField("status");

  const isValid = computed(() => meta.value.valid);

  return {
    name,
    nameAttrs,
    attributeId,
    attributeIdAttrs,
    status,
    statusAttrs,
    errors,
    handleSubmit,
    resetForm,
    isValid,
  };
}
