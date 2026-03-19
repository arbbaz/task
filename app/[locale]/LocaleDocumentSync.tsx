"use client";

import { useEffect } from "react";

interface LocaleDocumentSyncProps {
  locale: string;
}

export default function LocaleDocumentSync({ locale }: LocaleDocumentSyncProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
