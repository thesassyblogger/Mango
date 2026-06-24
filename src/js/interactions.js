export function initInteractions(sceneControls) {
  initSceneEvents(sceneControls);
  initRevealAnimations();
  initVarietyButtons(sceneControls);
  initReserveForm();
}

function initSceneEvents(sceneControls) {
  window.addEventListener("resize", sceneControls.resize);
  window.addEventListener("scroll", sceneControls.updateScrollProgress, { passive: true });
  window.addEventListener("pointermove", (event) => {
    sceneControls.setPointer(event.clientX, event.clientY);
    moveCursorOrb(event.clientX, event.clientY);
  });
}

function initRevealAnimations() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

function initVarietyButtons(sceneControls) {
  document.querySelectorAll(".variety").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".variety").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      sceneControls.setVarietyTone(button.dataset.tone);
      pulseBodyColor();
    });
  });
}

function initReserveForm() {
  const form = document.querySelector(".reserve__form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = event.currentTarget.querySelector(".form-note");
    note.textContent = "Invite requested. The grove will whisper back soon.";
  });
}

function moveCursorOrb(clientX, clientY) {
  const orb = document.querySelector(".cursor-orb");
  if (!orb) return;

  orb.style.left = `${clientX}px`;
  orb.style.top = `${clientY}px`;
}

function pulseBodyColor() {
  document.body.animate(
    [
      { filter: "saturate(1)" },
      { filter: "saturate(1.45) brightness(1.04)" },
      { filter: "saturate(1)" }
    ],
    { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}
