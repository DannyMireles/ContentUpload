import type { PlatformId } from "@/lib/types";

import { ensureProviderConfigured, getProviderConfig } from "@/lib/oauth/providers";

export function isProviderConfigured(platform: PlatformId) {
  return ensureProviderConfigured(getProviderConfig(platform));
}
