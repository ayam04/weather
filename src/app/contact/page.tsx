import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the people behind this weather site.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <ProsePage title="Contact">
      {SITE.contactEmail ? (
        <p>
          For corrections, data questions, partnerships or anything else, email{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
      ) : (
        <p>Contact details are not configured for this deployment.</p>
      )}
      <p>If you are reporting a forecast or climate figure that looks wrong, include the place and what you saw. It helps us find the problem quickly.</p>
    </ProsePage>
  );
}
