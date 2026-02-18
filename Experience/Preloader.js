import { EventEmitter } from "events";
import Experience from "./Experience.js";
import GSAP from "gsap";
import convert from "./Utils/covertDivsToSpans.js";

export default class Preloader extends EventEmitter {
  constructor() {
    super();

    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.world = this.experience.world;
    this.device = this.sizes.device;

    this.sizes.on("switchdevice", (device) => {
      this.device = device;
    });

    this.world.on("worldready", () => {
      this.setAssets();
      this.playIntro();
    });
  }

  setAssets() {
    convert(document.querySelector(".intro-text"));
    convert(document.querySelector(".hero-main-title"));
    convert(document.querySelector(".hero-main-description"));
    convert(document.querySelector(".hero-second-subheading"));
    convert(document.querySelector(".second-sub"));

    this.room = this.experience.world.room.actualRoom;
    this.roomChildren = this.experience.world.room.roomChildren;
    console.log(this.roomChildren);
  }

  firstIntro() {
    return new Promise((resolve) => {
      this.timeline = new GSAP.timeline();
      this.timeline.set(".animatedis", { y: 0, yPercent: 100 });
      this.timeline.to(".preloader", {
        opacity: 0,
        delay: 1,
        onComplete: () => {
          document.querySelector(".preloader").classList.add("hidden");
        },
      });
      if (this.device === "desktop") {
        this.timeline
          .to(this.roomChildren.cube.scale, {
            x: 0.3,
            y: 0.3,
            z: 0.3,
            ease: "back.out(2.5)",
            duration: 0.7,
          })

          .to(this.room.position, {
            x: -1,
            ease: "power1.out",
            duration: 0.7,
          });
      } else {
        this.timeline
          .to(this.roomChildren.cube.scale, {
            x: 0.3,
            y: 0.3,
            z: 0.3,
            ease: "back.out(2.5)",
            duration: 0.7,
          })
          .to(this.room.position, {
            z: -1,
            ease: "power1.out",
            duration: 0.7,
          });
      }
      this.timeline
        .to(".intro-text .animatedis", {
          yPercent: 0,
          stagger: 0.05,
          ease: "back.out(1.7)",
        })
        .to(
          ".intro-text .animatedis",
          {
            yPercent: 100,
            stagger: 0.05,
            ease: "back.in(1.7)",
          },
          "fadeout"
        )
        .to(
          this.room.position,
          {
            x: 0,
            y: 0,
            z: 0,
            ease: "power1.out",
          },
          "same"
        )
        .to(
          ".arrow-svg-wrapper",
          {
            opacity: 1,
            onComplete: resolve,
          },
          "same"
        );
    });
  }

  secondIntro() {
    return new Promise((resolve) => {
      this.secondTimeline = new GSAP.timeline();

      this.secondTimeline
        .to(
          ".arrow-svg-wrapper",
          {
            opacity: 0,
          },
          "fadeout"
        )

        .to(
          this.camera.orthographicCamera.position,
          {
            y: 6.5,
          },
          "same"
        )
        .to(
          this.roomChildren.cube.scale,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
          },
          "introtext"
        )
        .to(
          ".hero-main-title .animatedis",
          {
            yPercent: 0,
            stagger: 0.07,
            ease: "back.out(1.7)",
          },
          "introtext"
        )
        .to(
          ".hero-main-description .animatedis",
          {
            yPercent: 0,
            stagger: 0.07,
            ease: "back.out(1.7)",
          },
          "introtext"
        )
        .to(
          ".hero-second-subheading .animatedis",
          {
            yPercent: 0,
            stagger: 0.07,
            ease: "back.out(1.7)",
          },
          "introtext"
        )
        .to(
          ".second-sub .animatedis",
          {
            yPercent: 0,
            stagger: 0.07,
            ease: "back.out(1.7)",
          },
          "introtext"
        )

        .to(
          this.roomChildren.bed.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2.2)",
            duration: 0.5,
          },
          ">-0.5"
        )
        .to(
          this.roomChildren.decorations.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2.2)",
            duration: 0.5,
          },
          ">-0.4"
        )
        .to(
          this.roomChildren.wall.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2.2)",
            duration: 0.5,
          },
          ">-0.3"
        )
        .to(
          this.roomChildren.work.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2.2)",
            duration: 0.5,
          },
          ">-0.2"
        )
        .to(
          ".arrow-svg-wrapper",
          {
            opacity: 1,
            onComplete: resolve,
          },
          ">-0.5"
        );
    });
  }

  // Accelerate firstIntro when user scrolls during it
  onScrollDuringFirstIntro(e) {
    if (e.deltaY > 0 && this.timeline) {
      this.timeline.timeScale(4);
      // Remove listener once triggered — only accelerate once
      window.removeEventListener("wheel", this.firstIntroScrollEvent);
      this.removeTouchListeners();
    }
  }

  onTouchDuringFirstIntro(e) {
    this.firstIntroTouchStart = e.touches[0].clientY;
  }

  onTouchMoveDuringFirstIntro(e) {
    const touchEnd = e.touches[0].clientY;
    const diff = this.firstIntroTouchStart - touchEnd;
    if (diff > 20 && this.timeline) {
      this.timeline.timeScale(4);
      window.removeEventListener("wheel", this.firstIntroScrollEvent);
      this.removeTouchListeners();
    }
  }

  removeTouchListeners() {
    window.removeEventListener("touchstart", this.firstIntroTouchStartEvent);
    window.removeEventListener("touchmove", this.firstIntroTouchMoveEvent);
  }

  // Trigger secondIntro on scroll (existing logic)
  onScroll(e) {
    if (e.deltaY > 0) {
      window.removeEventListener("wheel", this.scrollOnceEvent);
      window.removeEventListener("touchstart", this.touchStartEvent);
      window.removeEventListener("touchmove", this.touchMoveEvent);
      this.playSecondIntro();
    }
  }

  onTouchStart(e) {
    this.initialY = e.touches[0].clientY;
  }

  onTouchMove(e) {
    const currentY = e.touches[0].clientY;
    const diff = this.initialY - currentY;
    if (diff > 20) {
      window.removeEventListener("wheel", this.scrollOnceEvent);
      window.removeEventListener("touchstart", this.touchStartEvent);
      window.removeEventListener("touchmove", this.touchMoveEvent);
      this.playSecondIntro();
    }
  }

  async playIntro() {
    // Listen for scroll/touch during firstIntro to accelerate it
    this.firstIntroScrollEvent = this.onScrollDuringFirstIntro.bind(this);
    this.firstIntroTouchStartEvent = this.onTouchDuringFirstIntro.bind(this);
    this.firstIntroTouchMoveEvent = this.onTouchMoveDuringFirstIntro.bind(this);

    window.addEventListener("wheel", this.firstIntroScrollEvent);
    window.addEventListener("touchstart", this.firstIntroTouchStartEvent);
    window.addEventListener("touchmove", this.firstIntroTouchMoveEvent);

    await this.firstIntro();

    // Clean up firstIntro listeners (in case user didn't scroll)
    window.removeEventListener("wheel", this.firstIntroScrollEvent);
    this.removeTouchListeners();

    // Now listen for scroll/touch to trigger secondIntro
    this.scrollOnceEvent = this.onScroll.bind(this);
    this.touchStartEvent = this.onTouchStart.bind(this);
    this.touchMoveEvent = this.onTouchMove.bind(this);

    window.addEventListener("wheel", this.scrollOnceEvent);
    window.addEventListener("touchstart", this.touchStartEvent);
    window.addEventListener("touchmove", this.touchMoveEvent);
  }

  async playSecondIntro() {
    await this.secondIntro();
    this.emit("enablecontrols");
  }
}
