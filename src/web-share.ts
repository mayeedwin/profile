import { webShare, copyText } from "pwafire";

export type ShareContext = "home" | "work" | "about" | "contact";

const shareTextByContext: Record<ShareContext, string> = {
  home: "Check out Maye Edwin's profile — Web Developer, Speaker & PWA Fire Creator #pwafire #MeetMaye",
  work: "Maye Edwin — Lead Web Developer at pwafire.org. Previously Microsoft 4Afrika Intern. #pwafire",
  about:
    "Maye Edwin — Technologist, Developer Community Builder & Creator of Project PWA Fire #pwafire",
  contact: "Let's connect — Maye Edwin's contact & profile #pwafire"
};

const getShareData = (context: ShareContext) => ({
  title: document.title,
  text: shareTextByContext[context],
  url: window.location.href
});

export const sharePage = async (
  context: ShareContext = "home"
): Promise<void> => {
  const data = getShareData(context);
  try {
    const { ok } = await webShare(data);
    if (!ok) await copyText(data.url);
  } catch {
    await copyText(data.url);
  }
};

const VALID_CONTEXTS: ShareContext[] = ["home", "work", "about", "contact"];

export const initWebShare = (): void => {
  document.querySelectorAll<HTMLElement>("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const raw = btn.getAttribute("data-share") ?? "home";
      const context: ShareContext = VALID_CONTEXTS.includes(raw as ShareContext)
        ? (raw as ShareContext)
        : "home";
      await sharePage(context);
    });
  });
};
