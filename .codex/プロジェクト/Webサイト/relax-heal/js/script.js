// js/script.js
// Relax Heal brand top page interactions

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Hero carousel (infinite loop, always scrolling right)
  // =========================
  const carousel = document.querySelector(".hero-carousel");
  const track = carousel?.querySelector(".carousel-track");
  const windowEl = carousel?.querySelector(".carousel-window");
  const prevBtn = carousel?.querySelector(".carousel-btn.prev");
  const nextBtn = carousel?.querySelector(".carousel-btn.next");
  const dotsContainer = carousel?.querySelector(".carousel-dots");

  if (carousel && track && windowEl && prevBtn && nextBtn && dotsContainer) {
    const originalSlides = Array.from(track.children);
    const slideCount = originalSlides.length;

    // create dots
    dotsContainer.innerHTML = "";
    originalSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `${index + 1}枚目へ`);
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    // clone first & last slide for seamless loop
    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
    const firstClone = originalSlides[0].cloneNode(true);
    lastClone.classList.add("is-clone");
    firstClone.classList.add("is-clone");

    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);

    const slides = Array.from(track.children);
    let currentIndex = 1; // start at first real slide
    let isAnimating = false;

    const getSlideWidth = () => {
      return slides[currentIndex]?.offsetWidth || 0;
    };

    const getGap = () => {
      const trackStyle = window.getComputedStyle(track);
      return parseFloat(trackStyle.gap) || 0;
    };

    const updateCarousel = (withTransition = true) => {
      const slideWidth = getSlideWidth();
      const gap = getGap();
      const windowWidth = windowEl.offsetWidth;

      // PC版: 中央配置のためのオフセット計算
      const centerOffset = (windowWidth - slideWidth) / 2;
      const offset = (currentIndex * (slideWidth + gap)) - centerOffset;

      if (withTransition) {
        track.style.transition = "transform 0.6s ease";
      } else {
        track.style.transition = "none";
      }

      track.style.transform = `translateX(-${offset}px)`;

      // update dots (クローンを除外した実際のインデックス)
      const realIndex = (currentIndex - 1 + slideCount) % slideCount;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === realIndex);
      });

      // update active class
      slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentIndex);
      });
    };

    const goToIndex = (index) => {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex = index;
      updateCarousel(true);
    };

    // 初期表示
    updateCarousel(false);

    // ボタンイベント
    nextBtn.addEventListener("click", () => {
      goToIndex(currentIndex + 1);
    });

    prevBtn.addEventListener("click", () => {
      goToIndex(currentIndex - 1);
    });

    // transitionend で無限ループを実現
    track.addEventListener("transitionend", () => {
      const currentSlide = slides[currentIndex];
      if (currentSlide && currentSlide.classList.contains("is-clone")) {
        if (currentIndex === slides.length - 1) {
          // moved to firstClone -> jump to first real slide
          currentIndex = 1;
        } else if (currentIndex === 0) {
          // moved to lastClone -> jump to last real slide
          currentIndex = slideCount;
        }
        updateCarousel(false);

        // 次のフレームでtransitionを復元
        requestAnimationFrame(() => {
          track.style.transition = "transform 0.6s ease";
        });
      }
      isAnimating = false;
    });

    // ドットクリック
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        goToIndex(dotIndex + 1); // +1 because of leading clone
      });
    });

    // リサイズ対応
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel(false);
      }, 100);
    });
  }

  // =========================
  // Category panel accordion
  // =========================
  const categoryButtons = document.querySelectorAll(
    ".category-panel .category-item > button, .category-panel-mobile .category-item > button"
  );

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const content = button.nextElementSibling;

      button.setAttribute("aria-expanded", (!isExpanded).toString());
      item.classList.toggle("is-open", !isExpanded);

      if (content && content.tagName === "UL") {
        content.style.maxHeight = !isExpanded
          ? content.scrollHeight + "px"
          : "0px";
      }
    });
  });

  // open default category if marked
  const defaultOpenItems = document.querySelectorAll(".category-item.is-open");
  defaultOpenItems.forEach((defaultOpenItem) => {
    const defaultButton = defaultOpenItem.querySelector("button");
    const defaultContent = defaultOpenItem.querySelector("ul");
    defaultButton?.setAttribute("aria-expanded", "true");
    if (defaultContent) {
      defaultContent.style.maxHeight = defaultContent.scrollHeight + "px";
    }
  });

  // =========================
  // Force media videos to stay muted
  // =========================
  const mediaVideos = document.querySelectorAll("video.media-video");

  mediaVideos.forEach((video) => {
    video.muted = true;
    video.volume = 0;

    video.addEventListener("volumechange", () => {
      if (!video.muted || video.volume > 0) {
        video.muted = true;
        video.volume = 0;
      }
    });
  });
});
