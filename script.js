const experience = document.getElementById("experience");
const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loaderProgress");
const loaderPercent = document.getElementById("loaderPercent");
const loaderStatus = document.getElementById("loaderStatus");

const sceneImages = [...document.querySelectorAll(".scene__image")];
const sceneSteps = [...document.querySelectorAll(".scene-step")];

const progressCurrent = document.querySelector(".progress__current");
const progressFill = document.getElementById("progressFill");
const scrollHint = document.getElementById("scrollHint");

const casePanel = document.getElementById("casePanel");
const caseClose = document.getElementById("caseClose");

const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");
const menuLinks = [...document.querySelectorAll("[data-menu-step]")];

let currentStep = 0;
let isAnimating = false;
let touchStartY = 0;
let wheelAccumulator = 0;
let lastWheelTime = 0;

const TOTAL_STEPS = sceneSteps.length;


/* -------------------------------------------------------
   LOADER
------------------------------------------------------- */

const loaderMessages = [
    "INITIALIZING",
    "LOADING SPACE",
    "CALIBRATING LIGHT",
    "PREPARING EVENING",
    "SYSTEM READY"
];

let loaderValue = 0;

function runLoader() {
    const interval = setInterval(() => {
        loaderValue += Math.floor(Math.random() * 5) + 2;

        if (loaderValue >= 100) {
            loaderValue = 100;
            clearInterval(interval);

            loaderStatus.textContent = loaderMessages[4];

            setTimeout(() => {
                loader.classList.add("loaded");
                document.body.classList.add("ready");
            }, 650);
        } else {
            const messageIndex = Math.min(
                Math.floor(loaderValue / 25),
                loaderMessages.length - 2
            );

            loaderStatus.textContent = loaderMessages[messageIndex];
        }

        loaderProgress.style.width = `${loaderValue}%`;
        loaderPercent.textContent = `${loaderValue}%`;
    }, 75);
}

window.addEventListener("load", runLoader);


/* -------------------------------------------------------
   SCENE
------------------------------------------------------- */

function updateScene(nextStep, direction = 1) {
    if (nextStep < 0 || nextStep >= TOTAL_STEPS || isAnimating) {
        return;
    }

    if (nextStep === currentStep) {
        return;
    }

    isAnimating = true;

    const previousStep = currentStep;
    currentStep = nextStep;

    sceneImages.forEach((image, index) => {
        image.classList.toggle("active", index === currentStep);
    });

    sceneSteps.forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
    });

    progressCurrent.textContent =
        String(currentStep + 1).padStart(2, "0");

    const progressValue =
        (currentStep / (TOTAL_STEPS - 1)) * 100;

    progressFill.style.width = `${progressValue}%`;

    if (currentStep === 0) {
        scrollHint.style.opacity = "1";
    } else {
        scrollHint.style.opacity = "0.25";
    }

    if (currentStep === 3) {
        experience.classList.add("table-active");
    } else {
        experience.classList.remove("table-active");
    }

    if (currentStep === TOTAL_STEPS - 1) {
        casePanel.classList.remove("closed");
    }

    animateTransition(previousStep, currentStep, direction);

    setTimeout(() => {
        isAnimating = false;
    }, 1100);
}


function animateTransition(from, to, direction) {
    const incomingImage = sceneImages[to];
    const incomingStep = sceneSteps[to];

    const offset = direction > 0 ? 40 : -40;

    incomingImage.style.transform =
        `scale(1.08) translateX(${offset}px)`;

    incomingStep.style.transform =
        `translateY(${direction > 0 ? 25 : -25}px)`;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            incomingImage.style.transform = "scale(1)";
            incomingStep.style.transform = "translateY(0)";
        });
    });
}


/* -------------------------------------------------------
   WHEEL / TRACKPAD
------------------------------------------------------- */

function handleWheel(event) {
    event.preventDefault();

    const now = Date.now();

    if (now - lastWheelTime < 60) {
        return;
    }

    lastWheelTime = now;

    wheelAccumulator += event.deltaY;

    const threshold = 80;

    if (Math.abs(wheelAccumulator) < threshold) {
        return;
    }

    const direction = wheelAccumulator > 0 ? 1 : -1;

    wheelAccumulator = 0;

    updateScene(currentStep + direction, direction);
}

experience.addEventListener(
    "wheel",
    handleWheel,
    { passive: false }
);


/* -------------------------------------------------------
   KEYBOARD
------------------------------------------------------- */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "ArrowDown" ||
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        event.key === " "
    ) {
        event.preventDefault();
        updateScene(currentStep + 1, 1);
    }

    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "PageUp"
    ) {
        event.preventDefault();
        updateScene(currentStep - 1, -1);
    }

    if (event.key === "Escape") {
        menuOverlay.classList.remove("open");
    }
});


/* -------------------------------------------------------
   TOUCH
------------------------------------------------------- */

experience.addEventListener(
    "touchstart",
    (event) => {
        touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
);

experience.addEventListener(
    "touchend",
    (event) => {
        const touchEndY = event.changedTouches[0].clientY;
        const difference = touchStartY - touchEndY;

        if (Math.abs(difference) < 45) {
            return;
        }

        const direction = difference > 0 ? 1 : -1;

        updateScene(currentStep + direction, direction);
    },
    { passive: true }
);


/* -------------------------------------------------------
   DRAG
------------------------------------------------------- */

let dragStartX = 0;
let dragging = false;

experience.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) {
        return;
    }

    dragging = true;
    dragStartX = event.clientX;
});

window.addEventListener("pointerup", (event) => {

    if (!dragging) {
        return;
    }

    dragging = false;

    const difference = dragStartX - event.clientX;

    if (Math.abs(difference) < 50) {
        return;
    }

    const direction = difference > 0 ? 1 : -1;

    updateScene(currentStep + direction, direction);
});


/* -------------------------------------------------------
   CASE PANEL
------------------------------------------------------- */

caseClose.addEventListener("click", () => {
    casePanel.classList.add("closed");
});


/* -------------------------------------------------------
   MENU
------------------------------------------------------- */

menuButton.addEventListener("click", () => {
    menuOverlay.classList.add("open");
});

menuClose.addEventListener("click", () => {
    menuOverlay.classList.remove("open");
});

menuLinks.forEach((link) => {

    link.addEventListener("click", (event) => {
        event.preventDefault();

        const targetStep =
            Number(link.dataset.menuStep);

        menuOverlay.classList.remove("open");

        setTimeout(() => {
            const direction =
                targetStep > currentStep ? 1 : -1;

            if (targetStep !== currentStep) {
                updateScene(targetStep, direction);
            }
        }, 350);
    });

});


/* -------------------------------------------------------
   TABLE INTERACTION
------------------------------------------------------- */

const tableHotspots =
    document.querySelectorAll(".table-hotspot");

tableHotspots.forEach((hotspot) => {

    hotspot.addEventListener("mouseenter", () => {
        experience.classList.add("table-active");
    });

    hotspot.addEventListener("mouseleave", () => {
        experience.classList.remove("table-active");
    });

});


/* -------------------------------------------------------
   MOUSE PARALLAX
------------------------------------------------------- */

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener("pointermove", (event) => {

    targetX =
        (event.clientX / window.innerWidth - 0.5) * 2;

    targetY =
        (event.clientY / window.innerHeight - 0.5) * 2;
});

function parallaxLoop() {

    mouseX += (targetX - mouseX) * 0.035;
    mouseY += (targetY - mouseY) * 0.035;

    const activeImage =
        sceneImages[currentStep];

    if (activeImage) {

        const movementX =
            mouseX * -5;

        const movementY =
            mouseY * -3;

        activeImage.style.setProperty(
            "--mouse-x",
            `${movementX}px`
        );

        activeImage.style.setProperty(
            "--mouse-y",
            `${movementY}px`
        );
    }

    requestAnimationFrame(parallaxLoop);
}

parallaxLoop();


/* -------------------------------------------------------
   HERO IMAGE INITIALIZATION
------------------------------------------------------- */

sceneImages.forEach((image, index) => {

    if (index === 0) {
        image.classList.add("active");
    } else {
        image.classList.remove("active");
    }

});


/* -------------------------------------------------------
   INITIAL UI
------------------------------------------------------- */

progressCurrent.textContent = "01";
progressFill.style.width = "0%";

sceneSteps.forEach((step, index) => {
    step.classList.toggle("active", index === 0);
});


/* -------------------------------------------------------
   BOOKING
------------------------------------------------------- */

const bookingButton =
    document.querySelector(".booking-button");

bookingButton.addEventListener("click", (event) => {
    event.preventDefault();

    bookingButton.textContent = "БРОНИРОВАНИЕ СКОРО";
    bookingButton.style.pointerEvents = "none";

    setTimeout(() => {
        bookingButton.textContent = "ЗАБРОНИРОВАТЬ СТОЛ";
        bookingButton.style.pointerEvents = "auto";
    }, 2200);
});
