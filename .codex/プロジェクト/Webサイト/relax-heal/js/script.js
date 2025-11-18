// js/script.js
// Relax Heal brand top page interactions

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Hero carousel (true infinite loop)
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
    let isTransitioning = false;
    let autoScrollInterval = null;

    const getSlideWidth = () => {
      return slides[0]?.offsetWidth || 0;
    };

    const getGap = () => {
      const trackStyle = window.getComputedStyle(track);
      return parseFloat(trackStyle.gap) || 0;
    };

    const updateCarousel = (withTransition = true) => {
      const slideWidth = getSlideWidth();
      const gap = getGap();
      const windowWidth = windowEl.offsetWidth;

      // 中央配置のためのオフセット計算
      const centerOffset = (windowWidth - slideWidth) / 2;
      const offset = currentIndex * (slideWidth + gap) - centerOffset;

      track.style.transition = withTransition ? "transform 0.6s ease" : "none";
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

    const move = (direction) => {
      if (isTransitioning) return;

      isTransitioning = true;
      currentIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      updateCarousel(true);
    };

    const goNext = () => move('next');
    const goPrev = () => move('prev');

    // 初期表示
    updateCarousel(false);

    // transitionend で無限ループを実現
    track.addEventListener("transitionend", (e) => {
      // transformプロパティの変化のみを処理
      if (e.propertyName !== 'transform') return;

      // 必ずisTransitioningをfalseに戻す
      isTransitioning = false;

      const currentSlide = slides[currentIndex];
      if (currentSlide && currentSlide.classList.contains("is-clone")) {
        // クローンに到達したら瞬間移動
        if (currentIndex === slides.length - 1) {
          // firstClone → 本物のslide1へ
          currentIndex = 1;
        } else if (currentIndex === 0) {
          // lastClone → 本物の最後のスライドへ
          currentIndex = slideCount;
        }

        // transitionなしで瞬間移動
        track.style.transition = "none";
        const slideWidth = getSlideWidth();
        const gap = getGap();
        const windowWidth = windowEl.offsetWidth;
        const centerOffset = (windowWidth - slideWidth) / 2;
        const offset = currentIndex * (slideWidth + gap) - centerOffset;
        track.style.transform = `translateX(-${offset}px)`;

        // ドットとactive classを更新
        const realIndex = (currentIndex - 1 + slideCount) % slideCount;
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === realIndex);
        });
        slides.forEach((slide, index) => {
          slide.classList.toggle("active", index === currentIndex);
        });
      }
    });

    // 長押しで連続スクロール
    const startAutoScroll = (direction) => {
      if (autoScrollInterval) return;

      // 最初の1回を即座に実行
      if (direction === 'next') {
        goNext();
      } else {
        goPrev();
      }

      // 以降は一定間隔で実行
      autoScrollInterval = setInterval(() => {
        if (direction === 'next') {
          goNext();
        } else {
          goPrev();
        }
      }, 400);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    };

    // Next button
    nextBtn.addEventListener("mousedown", () => startAutoScroll('next'));
    nextBtn.addEventListener("mouseup", stopAutoScroll);
    nextBtn.addEventListener("mouseleave", stopAutoScroll);
    nextBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startAutoScroll('next');
    });
    nextBtn.addEventListener("touchend", stopAutoScroll);
    nextBtn.addEventListener("touchcancel", stopAutoScroll);

    // Prev button
    prevBtn.addEventListener("mousedown", () => startAutoScroll('prev'));
    prevBtn.addEventListener("mouseup", stopAutoScroll);
    prevBtn.addEventListener("mouseleave", stopAutoScroll);
    prevBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startAutoScroll('prev');
    });
    prevBtn.addEventListener("touchend", stopAutoScroll);
    prevBtn.addEventListener("touchcancel", stopAutoScroll);

    // ドットクリック
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = dotIndex + 1; // +1 because of leading clone
        updateCarousel(true);
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
  // Category panel accordion (PC only)
  // =========================
  const categoryButtons = document.querySelectorAll(
    ".category-panel .category-item > button"
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

  // open default category if marked (PC only)
  const defaultOpenItems = document.querySelectorAll(".category-panel .category-item.is-open");
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
