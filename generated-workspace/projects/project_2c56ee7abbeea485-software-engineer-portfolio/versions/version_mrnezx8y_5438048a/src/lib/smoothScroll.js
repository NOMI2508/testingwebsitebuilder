export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};

export const scrollToSection = (href) => {
  const elementId = href.replace("#", "");
  smoothScrollTo(elementId);
};

export const getActiveSection = () => {
  const sections = ["hero", "about", "skills", "experience", "projects", "contact"];
  let activeSection = "hero";

  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        activeSection = section;
        break;
      }
    }
  }

  return activeSection;
};

export default smoothScrollTo;