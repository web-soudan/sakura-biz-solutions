// SP switch aria-hidden
const spItem = document.querySelectorAll("[data-show-sp]");
function setSpShow() {
  spItem.forEach((item) => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      item.setAttribute("aria-hidden", "true");
    } else {
      item.setAttribute("aria-hidden", "false");
    }
  });
}
if (spItem) {
  document.addEventListener("DOMContentLoaded", setSpShow);
  window.addEventListener("resize", setSpShow);
}

// PC switch aria-hidden
const pcItem = document.querySelectorAll("[data-hide-sp]");
function setSpHide() {
  pcItem.forEach((item) => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      item.setAttribute("aria-hidden", "false");
    } else {
      item.setAttribute("aria-hidden", "true");
    }
  });
}
if (pcItem) {
  document.addEventListener("DOMContentLoaded", setSpHide);
  window.addEventListener("resize", setSpHide);
}

// Tablet switch aria-hidden
const tbItem = document.querySelectorAll("[data-show-tb]");
function setTbShow() {
  tbItem.forEach((item) => {
    if (window.matchMedia("(min-width: 992px)").matches) {
      item.setAttribute("aria-hidden", "true");
    } else {
      item.setAttribute("aria-hidden", "false");
    }
  });
}
if (tbItem) {
  document.addEventListener("DOMContentLoaded", setTbShow);
  window.addEventListener("resize", setTbShow);
}

const tbHideItem = document.querySelectorAll("[data-hide-tb]");
function setTbHide() {
  tbHideItem.forEach((item) => {
    if (window.matchMedia("(min-width: 992px)").matches) {
      item.setAttribute("aria-hidden", "false");
    } else {
      item.setAttribute("aria-hidden", "true");
    }
  });
}
if (tbHideItem) {
  document.addEventListener("DOMContentLoaded", setTbHide);
  window.addEventListener("resize", setTbHide);
}

// Toggle
const toggleButtons = document.querySelectorAll(".js-toggle-button");
toggleButtons.forEach((button, index) => {
  const toggleControls = button.getAttribute("aria-controls");
  const panel = document.getElementById(toggleControls);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", !isExpanded);
    panel.setAttribute("aria-hidden", isExpanded);
  });
});

// Global Navigation
const globalnavButtons = document.querySelectorAll(".js-globalnav-button");
globalnavButtons.forEach((button, index) => {
  const toggleControls = button.getAttribute("aria-controls");
  const panel = document.getElementById(toggleControls);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    if (window.matchMedia("(min-width: 992px)").matches) {
      globalnavButtons.forEach((otherButton) => {
        if (otherButton !== button) {
          const otherControls = otherButton.getAttribute("aria-controls");
          const otherPanel = document.getElementById(otherControls);
          otherButton.setAttribute("aria-expanded", "false");
          otherPanel.setAttribute("aria-hidden", "true");
        }
      });
    }

    button.setAttribute("aria-expanded", !isExpanded);
    panel.setAttribute("aria-hidden", isExpanded);
  });

  // コンテンツ外をクリックしたらナビゲーションを閉じる
  document.addEventListener("click", (e) => {
    if (window.matchMedia("(min-width: 992px)").matches) {
      if (!button.contains(e.target) && !panel.contains(e.target)) {
        button.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
      }
    }
  });
});

// Footer Navigation
const footerButtons = document.querySelectorAll(".js-footer-button");
const footerItems = document.querySelectorAll(".footer-service-contents dd");
function footerContents() {
  footerItems.forEach((item) => {
    if (window.matchMedia("(min-width: 992px)").matches) {
      item.setAttribute("aria-hidden", "false");
    } else {
      item.setAttribute("aria-hidden", "true");
    }
  });
}
document.addEventListener("DOMContentLoaded", footerContents);
window.addEventListener("resize", footerContents);

footerButtons.forEach((button, index) => {
  const toggleControls = button.getAttribute("aria-controls");
  const panel = document.getElementById(toggleControls);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    if (window.matchMedia("(max-width: 991px)").matches) {
      button.setAttribute("aria-expanded", !isExpanded);
      panel.setAttribute("aria-hidden", isExpanded);
    }
  });
});


//
// column list
//
const container = document.querySelector('.js-column-list');
function columnList() {
  const pageKey = container.getAttribute('data-page');

  fetch('/assets/json/column.json')
    .then(response => response.json())
    .then(data => {
      const articleIds = data[pageKey];
      if (articleIds) {
        const ids = articleIds.join(',');
        fetchAndDisplayPosts(ids, articleIds); // async関数にidsとarticleIdsを渡す
      }
    })
    .catch(error => console.error('Error fetching column JSON:', error));

  // 投稿情報を表示する関数
  function displayPost(post, container, imageUrl) {
    const columnElement = document.createElement('li');
    columnElement.classList.add('splide__slide');

    columnElement.innerHTML = `
      <a href="${post.link}" class="c-card-link">
        <figure class="link-figure">
          <img src="${imageUrl}" alt="">
        </figure>
        <div class="link-text">
          <p class="link-title">${post.title.rendered}</p>
          <span class="link-arrow">記事を読む</span>
        </div>
      </a>
    `;
    container.appendChild(columnElement); // アイキャッチ画像取得後に要素を追加
  }

  // 投稿を順番通りに取得して表示する関数
  async function fetchAndDisplayPosts(ids, articleIds) {
    try {
      const response = await fetch(`https://rs.sakura.ad.jp/column/wp-json/wp/v2/posts?include=${ids}`);
      const posts = await response.json();

      // articleIds順に並べ替え
      const orderedPosts = articleIds.map(id => posts.find(post => post.id === id));

      // アイキャッチ画像を非同期で取得し、全ての画像取得が終わったら表示
      const postPromises = orderedPosts.map(post => {
        return fetch(`https://rs.sakura.ad.jp/column/wp-json/wp/v2/media/${post.featured_media}`)
          .then(response => response.json())
          .then(media => {
            const imageUrl = media.source_url;
            return { post, imageUrl }; // 画像URLをまとめて返す
          });
      });
      // 全てのアイキャッチ画像が取得されたら、順番通りに表示
      const postsWithImages = await Promise.all(postPromises);

      postsWithImages.forEach(({ post, imageUrl }) => {
        displayPost(post, container, imageUrl); // 投稿と画像URLを順番通りに表示
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
}

if (container) {
  document.addEventListener("DOMContentLoaded", columnList);
}


// plan slider only sp
const planSliderItem = document.querySelector(".js-plan-slider");
function planSlider() {
  var planSlider = new Splide(".js-plan-slider", {
    mediaQuery: 'min',
    type: "loop",
    autoplay: false,
    perPage: 1,
    start: 1,
    easing: "ease-in-out",
    padding: "2.91rem",
    arrows: false,
    pagination: false,
    pauseOnHover: false,
    easing: "ease-in-out",
    drag: true,
    breakpoints: {
        768: {
            perPage: 2,
        },
        992: {
            destroy: true,
        },
    },
  });
  planSlider.on("destroy", () => {
    for ( let splide of planSlider.Components.Elements.list.children ){
        for ( let focusableNode of splide.querySelectorAll(planSlider.options.focusableNodes)) {
            focusableNode.setAttribute('tabindex', '');
        }
    }
  })
  planSlider.mount();
}

if(planSliderItem) {
  window.addEventListener("load", planSlider);
}

// card slider only sp
var cardSliders = document.querySelectorAll('.js-card-slider');
function cardSlider() {
  cardSliders.forEach(function (slider) {
    const slides = new Splide(slider, {
      mediaQuery: 'min',
      type: "loop",
      autoplay: false,
      perPage: 1,
      start: 0,
      easing: "ease-in-out",
      padding: "3.28rem",
      gap: "2rem",
      arrows: false,
      pagination: false,
      pauseOnHover: false,
      lazyLoad: "sequential",
      easing: "ease-in-out",
      drag: true,
      breakpoints: {
          768: {
              destroy: true,
          },
      },
    })
    slides.on("destroy", () => {
      for ( let splide of slides.Components.Elements.list.children ){
          for ( let focusableNode of splide.querySelectorAll(slides.options.focusableNodes)) {
              focusableNode.setAttribute('tabindex', '');
          }
      }
    })
    slides.mount();
  });
}

if(cardSliders) {
  window.addEventListener("load", cardSlider);
}

// modal
const modalButtons = document.querySelectorAll('.js-modal')
modalButtons.forEach((button, index) => {
  const modalControls = button.getAttribute("aria-controls");
  const dialog = document.getElementById(modalControls);
  button.addEventListener('click', () => {
    button.setAttribute("aria-expanded", "true");
    dialog.showModal();
  });
  //ダイアログのクリックイベント
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inDialog) {
      button.setAttribute("aria-expanded", "false");
      dialog.close();
    }
  });

  const modalCloseButton = dialog.querySelector('.js-modal-close')
  modalCloseButton.addEventListener('click', () => {
    button.setAttribute("aria-expanded", "false");
    dialog.close();
  });
});

