import { render } from "@testing-library/react";
import LocaleDocumentSync from "./LocaleDocumentSync";

describe("LocaleDocumentSync", () => {
  it("updates the document lang attribute when locale changes", () => {
    const { rerender } = render(<LocaleDocumentSync locale="de" />);
    expect(document.documentElement.lang).toBe("de");

    rerender(<LocaleDocumentSync locale="nl" />);
    expect(document.documentElement.lang).toBe("nl");
  });
});
