import type { ReactNode } from "react";

/**
 * Like `PropsWithChildren`, but `children` is required rather than optional.
 */
export interface PropsWithChildrenRequired {
  children: ReactNode;
}
