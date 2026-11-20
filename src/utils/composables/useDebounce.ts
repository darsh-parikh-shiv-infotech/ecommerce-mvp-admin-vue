import { onScopeDispose, ref, watch } from "vue";
import type { Ref } from "vue";

export function useDebounce<T>(source: Ref<T>, delay = 400): Ref<T> {
  const debouncedValue = ref(source.value) as Ref<T>;

  let timeout: ReturnType<typeof setTimeout> | undefined;

  watch(source, (newValue) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
      timeout = undefined;
    }, delay);
  });

  onScopeDispose(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  return debouncedValue;
}
