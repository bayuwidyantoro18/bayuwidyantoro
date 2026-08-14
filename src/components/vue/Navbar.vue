<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

interface NavigationItem {
  label: string;
  id: string;
  href: string;
}

const navigation: NavigationItem[] = [
  {
    label: 'Home',
    id: 'home',
    href: '#home',
  },
  {
    label: 'About Me',
    id: 'about',
    href: '#about',
  },
  {
    label: 'Experience',
    id: 'experience',
    href: '#experience',
  },
  {
    label: 'Skills',
    id: 'skills',
    href: '#skills',
  },
  {
    label: 'Portfolio',
    id: 'portfolio',
    href: '#portfolio',
  },
  {
    label: 'Contact',
    id: 'contact',
    href: '#contact',
  },
];

const leftNavigation = navigation.slice(0, 2);
const rightNavigation = navigation.slice(2);

const menuOpen = ref(false);
const isScrolled = ref(false);
const activeSection = ref('home');

let sectionObserver: IntersectionObserver | null = null;

/* ============================
   SCROLL STATE
============================ */

const handleScroll = () => {
  isScrolled.value = window.scrollY > 45;
};


/* ============================
   MOBILE MENU
============================ */

const closeMenu = (section?: string) => {
  menuOpen.value = false;

  if (section) {
    activeSection.value = section;
  }
};


const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    menuOpen.value = false;
  }
};


/* Lock body ketika mobile menu terbuka */

watch(menuOpen, (open) => {
  document.body.style.overflow = open
    ? 'hidden'
    : '';
});


/* ============================
   ACTIVE SECTION
============================ */

const setupSectionObserver = () => {
  const sections = navigation
    .map(item => document.getElementById(item.id))
    .filter(
      (section): section is HTMLElement =>
        section !== null
    );

  sectionObserver = new IntersectionObserver(
    (entries) => {

      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio -
            a.intersectionRatio
        );

      if (visibleSections.length > 0) {
        activeSection.value =
          visibleSections[0].target.id;
      }

    },
    {
      root: null,

      /*
       * Area aktif dibuat di bagian tengah viewport.
       * Dengan begitu menu tidak terlalu cepat
       * berpindah ketika section baru sedikit terlihat.
       */
      rootMargin: '-25% 0px -60% 0px',

      threshold: [
        0,
        0.1,
        0.25,
        0.5,
      ],
    }
  );

  sections.forEach(section => {
    sectionObserver?.observe(section);
  });
};


/* ============================
   LIFECYCLE
============================ */

onMounted(() => {
  handleScroll();

  window.addEventListener(
    'scroll',
    handleScroll,
    {
      passive: true,
    }
  );

  window.addEventListener(
    'keydown',
    handleEscape
  );

  setupSectionObserver();
});


onUnmounted(() => {
  window.removeEventListener(
    'scroll',
    handleScroll
  );

  window.removeEventListener(
    'keydown',
    handleEscape
  );

  sectionObserver?.disconnect();

  document.body.style.overflow = '';
});
</script>


<template>

  <header
    class="navbar"
    :class="{
      'navbar--scrolled': isScrolled,
      'navbar--menu-open': menuOpen,
    }"
  >

    <div class="navbar__container">

      <!-- ========================
           LEFT NAVIGATION
      ========================= -->

      <nav
        class="navbar__menu navbar__menu--left"
        aria-label="Primary navigation"
      >

        <a
          v-for="item in leftNavigation"
          :key="item.id"
          :href="item.href"
          :class="{
            'is-active':
              activeSection === item.id,
          }"
          @click="closeMenu(item.id)"
        >
          {{ item.label }}
        </a>

      </nav>


      <!-- ========================
           BRAND
      ========================= -->

      <a
        href="#home"
        class="navbar__brand"
        @click="closeMenu('home')"
      >
        Bayu Widyantoro
      </a>


      <!-- ========================
           RIGHT NAVIGATION
      ========================= -->

      <nav
        class="navbar__menu navbar__menu--right"
        aria-label="Secondary navigation"
      >

        <a
          v-for="item in rightNavigation"
          :key="item.id"
          :href="item.href"
          :class="{
            'is-active':
              activeSection === item.id,
          }"
          @click="closeMenu(item.id)"
        >
          {{ item.label }}
        </a>

      </nav>


      <!-- ========================
           MOBILE TOGGLE
      ========================= -->

      <button
        class="navbar__toggle"
        :class="{
          'is-active': menuOpen,
        }"
        type="button"
        aria-label="Toggle navigation menu"
        aria-controls="mobile-navigation"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >

        <span></span>
        <span></span>
        <span></span>

      </button>


      <!-- ========================
           MOBILE NAVIGATION
      ========================= -->

      <div
        id="mobile-navigation"
        class="navbar__mobile"
        :class="{
          'is-open': menuOpen,
        }"
      >

        <nav>

          <a
            v-for="item in navigation"
            :key="item.id"
            :href="item.href"
            :class="{
              'is-active':
                activeSection === item.id,
            }"
            @click="closeMenu(item.id)"
          >
            <span class="navbar__mobile-number">
              {{
                String(
                  navigation.indexOf(item) + 1
                ).padStart(2, '0')
              }}
            </span>

            <span>
              {{ item.label }}
            </span>
          </a>

        </nav>

      </div>

    </div>

  </header>

</template>


<style scoped>

/* =================================
   NAVBAR
================================= */

.navbar {
  position: fixed;

  top: 0;
  left: 0;

  width: 100%;

  z-index: 1000;

  background:
    rgba(7, 9, 11, 0);

  transition:
    background 0.4s ease,
    box-shadow 0.4s ease,
    backdrop-filter 0.4s ease;
}


/* ================================
   GLASS STATE
================================ */

.navbar--scrolled {
  background:
    rgba(7, 9, 11, 0.78);

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  box-shadow:
    0 12px 40px
    rgba(0, 0, 0, 0.12);
}


/* =================================
   CONTAINER
================================= */

.navbar__container {
  position: relative;

  width:
    min(100% - 48px, 1240px);

  height: 92px;

  margin: 0 auto;

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto
    minmax(0, 1fr);

  align-items: center;

  border-bottom:
    1px solid
    rgba(255, 255, 255, 0.14);

  transition:
    height 0.4s ease,
    border-color 0.4s ease;
}


/* navbar lebih compact saat scroll */

.navbar--scrolled
.navbar__container {
  height: 72px;

  border-color:
    rgba(255, 255, 255, 0.07);
}


/* =================================
   NAVIGATION
================================= */

.navbar__menu {
  display: flex;

  align-items: center;

  gap: 30px;
}


.navbar__menu--left {
  justify-content: flex-start;
}


.navbar__menu--right {
  justify-content: flex-end;
}


/* =================================
   LINK
================================= */

.navbar__menu a {
  position: relative;

  padding:
    8px 0;

  color:
    rgba(255, 255, 255, 0.55);

  font-size: 11px;

  font-weight: 400;

  letter-spacing:
    0.02em;

  white-space: nowrap;

  transition:
    color 0.3s ease;
}


/* underline */

.navbar__menu a::after {
  content: '';

  position: absolute;

  left: 0;
  bottom: 0;

  width: 0;
  height: 1px;

  background: #d1a467;

  transition:
    width 0.35s ease;
}


/* hover */

.navbar__menu a:hover {
  color: #ffffff;
}


.navbar__menu a:hover::after {
  width: 100%;
}


/* active */

.navbar__menu a.is-active {
  color: #ffffff;
}


.navbar__menu a.is-active::after {
  width: 100%;
}


/* =================================
   BRAND
================================= */

.navbar__brand {
  position: relative;

  z-index: 30;

  padding:
    0 45px;

  color: #ffffff;

  font-family:
    var(--font-display);

  font-size:
    clamp(24px, 2vw, 33px);

  font-weight: 500;

  line-height: 1;

  white-space: nowrap;

  transition:
    font-size 0.4s ease,
    color 0.3s ease;
}


.navbar--scrolled
.navbar__brand {
  font-size:
    clamp(22px, 1.7vw, 29px);
}


/* =================================
   MOBILE TOGGLE
================================= */

.navbar__toggle {
  display: none;

  position: relative;

  z-index: 30;

  width: 42px;
  height: 42px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}


.navbar__toggle span {
  display: block;

  width: 24px;
  height: 1px;

  margin: 6px auto;

  background: #ffffff;

  transform-origin: center;

  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}


/* hamburger → X */

.navbar__toggle.is-active
span:nth-child(1) {
  transform:
    translateY(7px)
    rotate(45deg);
}


.navbar__toggle.is-active
span:nth-child(2) {
  opacity: 0;
}


.navbar__toggle.is-active
span:nth-child(3) {
  transform:
    translateY(-7px)
    rotate(-45deg);
}


/* =================================
   MOBILE NAVIGATION
================================= */

.navbar__mobile {
  display: none;
}


/* =================================
   TABLET / MOBILE
================================= */

@media (max-width: 960px) {

  .navbar__container {
    width:
      min(100% - 32px, 1240px);

    height: 82px;

    display: flex;

    justify-content:
      space-between;

    align-items: center;
  }


  .navbar--scrolled
  .navbar__container {
    height: 68px;
  }


  .navbar__menu {
    display: none;
  }


  .navbar__brand {
    padding: 0;

    font-size: 27px;
  }


  .navbar--scrolled
  .navbar__brand {
    font-size: 25px;
  }


  .navbar__toggle {
    display: block;
  }


  /* =============================
     MOBILE FULLSCREEN MENU
  ============================= */

  .navbar__mobile {
    display: block;

    position: fixed;

    inset: 0;

    z-index: 20;

    background:
      rgba(7, 9, 11, 0.98);

    opacity: 0;

    visibility: hidden;

    pointer-events: none;

    transition:
      opacity 0.4s ease,
      visibility 0.4s ease;
  }


  .navbar__mobile::before {
    content: '';

    position: absolute;

    width: 500px;
    height: 500px;

    right: -260px;
    bottom: -200px;

    background:
      radial-gradient(
        circle,
        rgba(209, 164, 103, 0.08),
        transparent 70%
      );
  }


  .navbar__mobile.is-open {
    opacity: 1;

    visibility: visible;

    pointer-events: auto;
  }


  .navbar__mobile nav {
    position: relative;

    z-index: 2;

    width:
      min(100% - 50px, 500px);

    height: 100%;

    margin: 0 auto;

    padding-top: 110px;

    display: flex;

    flex-direction: column;

    justify-content: center;
  }


  .navbar__mobile a {
    position: relative;

    display: flex;

    align-items: center;

    gap: 22px;

    padding:
      17px 0;

    border-bottom:
      1px solid
      rgba(255, 255, 255, 0.07);

    color:
      rgba(255, 255, 255, 0.42);

    font-family:
      var(--font-display);

    font-size:
      clamp(35px, 8vw, 52px);

    line-height: 1;

    transition:
      color 0.3s ease,
      padding-left 0.3s ease;
  }


  .navbar__mobile a:hover,
  .navbar__mobile a.is-active {
    color: #ffffff;

    padding-left: 10px;
  }


  .navbar__mobile a.is-active::after {
    content: '';

    position: absolute;

    right: 0;

    width: 28px;
    height: 1px;

    background: #d1a467;
  }


  .navbar__mobile-number {
    width: 25px;

    color: #d1a467;

    font-family:
      var(--font-primary);

    font-size: 8px;

    letter-spacing:
      0.14em;
  }

}


/* =================================
   SMALL MOBILE
================================= */

@media (max-width: 480px) {

  .navbar__container {
    width:
      calc(100% - 28px);

    height: 76px;
  }


  .navbar--scrolled
  .navbar__container {
    height: 64px;
  }


  .navbar__brand {
    font-size: 24px;
  }


  .navbar--scrolled
  .navbar__brand {
    font-size: 23px;
  }


  .navbar__mobile nav {
    width:
      calc(100% - 42px);
  }


  .navbar__mobile a {
    font-size:
      clamp(34px, 11vw, 46px);

    padding:
      15px 0;
  }

}

</style>