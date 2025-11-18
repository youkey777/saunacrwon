// js/script.js
// Relax Heal brand top page interactions

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Hero carousel (infinite loop + center-aligned)
  // =========================
  const carousel = document.querySelector(".hero-carousel");
  const track = carousel?.querySelector(".carousel-track");
  const windowEl = carousel?.querySelector(".carousel-window");
  const nextBtn = carousel?.querySelector(".carousel-btn.next");
  const dotsContainer = carousel?.querySelector(".carousel-dots");

  if (carousel && track && windowEl && nextBtn && dotsContainer) {
    let slides = Array.from(track.children);
    const slideCount = slides.length;

    // create dots
    dotsContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `${index + 1}枚目へ`);
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    // clone first & last slide for seamless loop
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.add("is-clone");
    lastClone.classList.add("is-clone");
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    slides = Array.from(track.children);

    let currentIndex = 1; // because of leading clone
    let isAnimating = false;
    let autoPlayInterval = null;

    const updateCarousel = () => {
      const activeSlide = slides[currentIndex];
      if (!activeSlide || !windowEl) return;

      const slideWidth = activeSlide.offsetWidth;
      const slideLeft = activeSlide.offsetLeft;
      const windowWidth = windowEl.offsetWidth;

      // スライド中央 - ウィンドウ中央 の差分を求める
      const offset = slideLeft + slideWidth / 2 - windowWidth / 2;
      track.style.transform = `translateX(${-offset}px)`;

      // is-center クラスの付け替え
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-center", index === currentIndex);
      });

      // ドットの更新（クローンを除外）
      const realIndex = ((currentIndex - 1 + slideCount) % slideCount);
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === realIndex);
      });
    };

    const goToIndex = (index) => {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex = index;
      track.style.transition = "transform 0.6s ease";
      updateCarousel();
    };

    // 自動再生機能
    const startAutoPlay = () => {
      if (autoPlayInterval) return;
      autoPlayInterval = setInterval(() => {
        goToIndex(currentIndex + 1);
      }, 2000);
    };

    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    };

    const restartAutoPlay = () => {
      stopAutoPlay();
      setTimeout(() => {
        startAutoPlay();
      }, 5000);
    };

    // 初期表示
    track.style.display = "flex";
    updateCarousel();
    startAutoPlay();

    // ボタンイベント
    nextBtn.addEventListener("click", () => {
      restartAutoPlay();
      goToIndex(currentIndex + 1);
    });

    // transitionend で無限ループを実現
    track.addEventListener("transitionend", () => {
      const currentSlide = slides[currentIndex];
      if (currentSlide && currentSlide.classList.contains("is-clone")) {
        // クローンスライド到達 → 瞬間ジャンプ
        track.style.transition = "none";
        if (currentIndex === slides.length - 1) {
          currentIndex = 1;
        } else if (currentIndex === 0) {
          currentIndex = slides.length - 2;
        }
        updateCarousel();

        // 瞬間ジャンプ後、レンダリング完了を待ってからフラグ解除
        setTimeout(() => {
          track.style.transition = "transform 0.6s ease";
          isAnimating = false;
        }, 50);
      } else {
        // 通常スライド → 即座にフラグ解除
        isAnimating = false;
      }
    });

    // ドットクリック
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        restartAutoPlay();
        goToIndex(dotIndex + 1); // +1 because of leading clone
      });
    });

    // リサイズ対応
    window.addEventListener("resize", () => {
      updateCarousel();
    });

    // ページ離脱時のクリーンアップ
    window.addEventListener("beforeunload", () => {
      stopAutoPlay();
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
