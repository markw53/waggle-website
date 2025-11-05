import CookieConsent from "react-cookie-consent";

export default function CookieConsentBanner() {
  return (
    <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="waggleCookieConsent"
        containerClasses="bg-zinc-900 text-white text-sm p-4"
        buttonClasses="bg-amber-700 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-md ml-4"
        declineButtonClasses="bg-gray-200 text-gray-800 px-4 py-2 rounded-md ml-2"
        >
        We use cookies to personalize content, improve user experience, and analyze traffic.{" "}
        <a href="/privacy" className="text-amber-400 underline">
            Learn more
        </a>
        .
    </CookieConsent>
  );
}